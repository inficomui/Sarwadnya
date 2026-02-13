## Overview
Users who join the platform with an initial investment of **10,000** are considered "Active" explicitly on the panel, but they are subject to ROI restrictions:
1.  **NO ROI**: They do not earn Daily ROI (ROI is skipped).
2.  **Referral Income ALLOWED**: They **CAN** earn Referral Commissions from their downline.
3.  **Withdrawals**: They can withdraw their Referral Income, but ROI payouts are skipped and thus not withdrawable.

## 1. User Status Flag
... (no changes) ...

## 2. Trigger Logic
... (no changes) ...

## 3. Enforcement Logic
The following logic is applied in the `payout:process` cron job:

### A. ROI Payouts
*   The Daily ROI processing script marks the payout status as **"Skipped"** for restricted users.
*   No net amount is added to their withdrawable balance for ROI.

### B. Referral Commissions
*   **Restricted users DO earn Referral Commissions.** If a downline user earns ROI, the restricted upline parent receives their commission as a "Processing" payout.
*   The restricted status does NOT block receiving commissions.

### C. Withdrawals
*   The automated withdrawal generation script **INCLUDES** restricted users.
*   It sums all payouts with status **"Processing"**.
*   Since restricted users have their ROI marked as "Skipped" and their Referral Income marked as "Processing", the generated withdrawal will **ONLY include Referral Commissions**.

## 4. API Integration

### User Dashboard
**Endpoint**: `GET /api/user/dashboard`

The `profile` object now includes the restriction status:
```json
{
    "status": "success",
    "data": {
        "profile": {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "is_payout_restricted": true,
            ...
        },
        ...
    }
}
```

### Recommendation for Frontend
When `is_payout_restricted` is `true`, it is recommended to:
1.  Display a "Restricted Account" badge on the dashboard.
2.  Disable the "Withdraw" button if applicable.
3.  Show a tooltip or notice explaining that the 10,000 joining plan is not eligible for daily payouts or commissions.

## 5. Technical Details
*   **Migration**: `2026_01_31_054549_add_is_payout_restricted_to_users_table.php`
*   **Command**: `ProcessPayouts.php` (Updated ROI and Commission logic)
*   **Trait**: `CreatesInvestment.php` (Updated activation logic)
*   **Controller**: `WalletController.php` (Updated `investForOther` logic)
