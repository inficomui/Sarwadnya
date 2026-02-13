import { BankDetail } from './types';

export interface WithdrawalPayoutItem {
    id: number;
    amount: string;
    net_amount: string;
    type: 'roi' | 'referral';
    tds: string;
    admin_charges: string;
    level?: number;
}

export interface WithdrawalSummary {
    total_roi_amount: string;
    total_referral_amount: string;
    total_tds: string;
    total_admin_charges: string;
    net_payable: string;
}

export interface Withdrawal {
    id: number;
    user_id?: number;
    user_name?: string;
    amount: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at?: string;
    bank_details?: BankDetail;
    payouts?: WithdrawalPayoutItem[];
    admin_note?: string;
    transaction_id?: string;
}

export interface GetWithdrawalsResponse {
    status: string;
    data: {
        current_page: number;
        data: Withdrawal[];
        first_page_url: string;
        last_page_url: string;
        total: number;
        per_page?: number;
        last_page: number;
        from?: number;
        to?: number;
        next_page_url?: string | null;
        prev_page_url?: string | null;
        path?: string;
    };
}

export interface GetWithdrawalDetailsResponse {
    status: string;
    data: Withdrawal;
    summary?: WithdrawalSummary;
}

export interface GetWithdrawalsParams {
    page?: number;
    per_page?: number;
    status?: string;
}

export interface UpdateWithdrawalStatusRequest {
    id: number;
    status: 'approved' | 'rejected';
    admin_note?: string;
    transaction_id?: string;
}

export interface UpdateWithdrawalStatusResponse {
    status: string;
    message: string;
}
