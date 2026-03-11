// FINANCE & TRANSACTION TYPES
import { User } from './user';

// INVESTMENT SCHEDULE TYPES

export interface Investment {
    id: number;
    user_id: number;
    amount: string; // Changed to string as per common Laravel API behavior for decimals
    method: string;
    reference_id: string;
    status: string;
    roi_percentage?: number;
    duration_months?: number;
    paid_months?: number;
    total_months?: number;
    created_at: string;
    updated_at?: string;
}

export interface InvestmentScheduleItem {
    id?: number;
    installment_no: number;
    amount: string;
    payout_date: string;
    status: 'Paid' | 'Processing' | 'Unmatured';
}

export interface GetInvestmentScheduleResponse {
    status: string;
    data: {
        investment: Investment;
        schedule: InvestmentScheduleItem[];
    };
}

export interface GetInvestmentsResponse {
    status: string;
    data: {
        current_page: number;
        data: Investment[];
        total: number;
        per_page?: number;
        last_page?: number;
    } | Investment[];
}

// TRANSFER TYPES
export interface Transfer {
    id: number;
    user_id: number;
    user_name?: string;
    user_email?: string;
    amount: string;
    method: string;
    reference_id?: string | null;
    notes?: string | null;
    receipt_image?: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    user?: User;
    investment?: Investment;
}

export interface GetAdminTransfersResponse {
    status: string;
    message?: string;
    data: Transfer[];
}

export interface GetUserTransfersResponse {
    status: string;
    message?: string;
    data: {
        transfers: Transfer[];
        total_transferred: string;
    };
}

export interface CreateTransferRequest {
    amount: number;
    method: string;
    reference_id?: string;
    notes?: string;
    receipt_image?: File;
}

export interface CreateTransferResponse {
    status: string;
    message: string;
    data: Transfer;
}

export interface UpdateTransferStatusRequest {
    id: number;
    status: 'approved' | 'rejected';
}

export interface UpdateTransferStatusResponse {
    status: string;
    message: string;
    data: Transfer;
}

// PAYMENT DETAILS TYPES
export interface PaymentDetails {
    id: number;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    account_holder_name: string;
    usdt_address: string;
    usdt_network: string;
    qr_code?: string;
    receipt_image?: string; // Alias or replacement
    status: number;
}

export interface GetPaymentDetailsResponse {
    status: string;
    data: PaymentDetails;
}

export interface UpdatePaymentDetailsRequest {
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    account_holder_name?: string;
    usdt_address?: string;
    usdt_network?: string;
    receipt_image?: string | File;
}

export interface UpdatePaymentDetailsResponse {
    status: string;
    message: string;
    data: PaymentDetails;
}

// DEPOSIT TYPES
export interface Deposit {
    id: number;
    user_id: number;
    user_name?: string;
    user_email?: string;
    amount: number;
    method: string;
    reference_id: string;
    receipt?: string;
    notes?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface CreateDepositRequest {
    amount: number;
    method: string;
    reference_id: string;
    receipt?: File;
    notes?: string;
}

export interface CreateDepositResponse {
    status: string;
    message: string;
    data: Deposit;
}

export interface GetDepositsResponse {
    status: string;
    data: {
        deposits: Deposit[];
        total_deposited: number;
    };
}

export interface GetAllDepositsResponse {
    status: string;
    data: Deposit[];
}

export interface UpdateDepositStatusRequest {
    id: number;
    status: 'approved' | 'rejected';
}

export interface UpdateDepositStatusResponse {
    status: string;
    message: string;
    data: Deposit;
}

// PAYOUT TYPES
export interface Payout {
    id: number;
    user_id: number;
    investment_id?: number;
    amount: string;
    net_amount?: string; // Total amount after deductions
    tds?: string;
    admin_charges?: string;
    type: 'roi' | 'referral';
    status?: string;
    level?: number;
    source_user_id?: number;
    payout_date: string;
    created_at: string;
    user?: User;
}

export interface PayoutSummary {
    total_earnings: number;
    total_roi: number;
    total_referral_commission: number;
}

export interface GetPayoutsResponse {
    status: string;
    data: {
        summary: PayoutSummary;
        history: {
            data: Payout[];
            current_page?: number;
            last_page?: number;
            per_page?: number;
            total?: number;
            links?: any[];
        };
    };
}

export interface MaturePayoutRequest {
    id: number;
}

export interface MaturePayoutResponse {
    status: string;
    message: string;
    data: Payout;
}


export interface GetPayoutsParams {
    page?: number;
    per_page?: number;
}

export interface GetPayoutsByRangeParams {
    start_date?: string;
    end_date?: string;
    user_id?: number; // Optional for admin to filter by user
}

export interface GetPayoutsByRangeResponse {
    status: string;
    data: Payout[];
}


// BANK DETAILS TYPES

export interface BankDetail {
    id: number;
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    branch_name?: string;
    usdt_address?: string;
    usdt_network?: string;
    is_primary: number | boolean;
    receipt_image?: string;
    qr_code?: string;
    created_at: string;
    updated_at: string;
}

export interface GetBankDetailsResponse {
    status: string;
    data: BankDetail[];
}

export interface BankDetailRequest {
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    branch_name?: string;
    is_primary?: boolean | string;
    receipt_image?: File | string;
}

export interface BankDetailResponse {
    status: string;
    message: string;
    data: BankDetail;
}

// WITHDRAWAL TYPES
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
