
// AUTH TYPES
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role?: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    token?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    result: {
        token?: string;
        user?: UserProfile;
    }
}

export interface LogoutResponse {
    message: string;
}

// FORGOT PASSWORD TYPES
export interface SendOTPRequest {
    identifier: string;
}

export interface SendOTPResponse {
    success: boolean;
    message: string;
}

export interface VerifyOTPRequest {
    identifier: string;
    otp: string;
}

export interface VerifyOTPResponse {
    success: boolean;
    message: string;
    token?: string;
}

export interface ResetPasswordRequest {
    identifier: string;
    otp: string;
    password: string;
    password_confirmation: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}


// USER DOMAIN TYPES
export interface User {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    email_verified_at: string | null;
    referral_code: string;
    created_at: string;
    updated_at: string;
    role?: string;
    is_wallet_active?: boolean;
    view_password?: string;
    kyc_status?: 'pending' | 'approved' | 'rejected' | 'not_submitted';
}

export interface UserLoginRequest {
    login: string; // Can be email or phone number
    password: string;
}

export interface UserLoginResponse {
    status: string;
    message: string;
    data: {
        user: User;
        access_token: string;
        token_type: string;
    };
}

export interface UserRegisterRequest {
    name: string;
    email: string;
    phone_number: string;
    password: string;
    password_confirmation: string;
    referral_code?: string;
}

export interface UserRegisterResponse {
    status: string;
    message: string;
    data: {
        user: User;
        access_token: string;
        token_type: string;
    };
}

export interface UserLogoutResponse {
    status: string;
    message: string;
}

export interface GetUsersParams {
    page?: number;
    per_page?: number;
    search?: string;
}

export interface UpdateDeviceTokenRequest {
    token: string;
    platform: string;
}

export interface UpdateDeviceTokenResponse {
    status: string;
    message: string;
}

// USER DASHBOARD TYPES
export interface UserDashboardResponse {
    status: string;
    data: {
        profile: {
            name: string;
            email: string;
            phone_number: string;
            kyc_status?: string;
        };
        referral: {
            code: string;
            link: string;
        };
        account: {
            status: string;
            rank: string;
            joined_at: string;
            is_wallet_active: boolean;
        };
        financials: {
            available_balance: number;
            total_deposited: number;
            total_withdrawn: number | string;
            total_earnings: number;
            earnings_breakdown: {
                roi_income: number;
                referral_income: number;
            };
        };
        network: {
            direct_partners: number;
            total_team_size: number;
        };
        earning_limit?: {
            reached: boolean;
            message: string;
        };
    };
}


// FINANCE & TRANSACTION TYPES

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
        // standard pagination fields
    } | Investment[]; // Handle both potentially
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
        total_withdrawn: number;
        transfers: Transfer[];
    };
}

export interface CreateTransferRequest {
    amount: number;
    method: string;
    reference_id?: string;
    notes?: string;
    receipt_image?: any; // File is not standard in RN, using any or Blob/string
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
    receipt_image?: string;
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
    receipt?: any;
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


export interface GetPayoutsParams {
    page?: number;
    per_page?: number;
}

export interface GetPayoutsByRangeParams {
    start_date: string;
    end_date: string;
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
    qr_code?: string;
    receipt_image?: string;
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
    is_primary?: boolean;
}

export interface BankDetailResponse {
    status: string;
    message: string;
    data: BankDetail;
}

// WITHDRAWAL TYPES moved to ./types_withdrawals

// COMMMON & PAGINATION TYPES

export interface PaginatedResponse<T> {
    status: string;
    data: {
        current_page: number;
        data: T[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    }
}

// REFERRAL & TREE TYPES

export interface TreeSummaryResponse {
    status: string;
    data: {
        total_referrals: number;
        levels: Record<string, number>;
    };
}

export interface TreeInvestmentSummaryResponse {
    status: string;
    data: {
        total_team_investment: number;
        levels: Record<string, number>;
    };
}

export interface TreeUser {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    created_at: string;
    total_investment?: string | number;
    investment?: number;
    commission_earned?: string | number;
    commission?: number;
    earnings?: string | number;
    total_payout?: string | number;
    payout?: string | number;
}

export interface TreeUsersData {
    current_page: number;
    data: TreeUser[];
    first_page_url?: string;
    from?: number;
    last_page?: number;
    last_page_url?: string;
    next_page_url?: string | null;
    path?: string;
    per_page?: number;
    prev_page_url?: string | null;
    to?: number;
    total: number;
}

export interface TreeUsersResponse {
    status: string;
    data: {
        level: number;
        users: TreeUsersData;
    };
}

export interface GetTreeUsersParams {
    level: number;
    page?: number;
    per_page?: number;
}

// REFERRAL DASHBOARD TYPES

export interface ReferralDashboardSummaryResponse {
    status: string;
    data: {
        total_earnings: number;
        total_earning?: number;
        referral_income?: number;
        referral_commission?: number;
        total_referral_commission?: number;
        level_wise_earnings: Record<string, number>;
        levels_earnings?: Record<string, number>;
        referral_code?: string;
        referral_link?: string;
    };
}

export interface ReferralSourceUser {
    id: number;
    name: string;
    email: string;
    created_at?: string; // Optional based on usage
}

export interface ReferralEarning {
    id: number;
    amount: string;
    net_amount: string;
    level: number;
    payout_date: string;
    status: string;
    source_user: {
        id: number;
        name: string;
        email: string;
    };
}

export interface ReferralEarningsHistoryResponse {
    status: string;
    data: {
        current_page: number;
        data: ReferralEarning[];
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

export interface GetReferralEarningsParams {
    page?: number;
    per_page?: number;
}

// WALLET TYPES

export interface WalletTransaction {
    id: number;
    type: 'credit' | 'debit';
    amount: string;
    description: string;
    status: 'approved' | 'pending' | 'rejected';
    created_at: string;
    related_user?: {
        id: number;
        name: string;
        email?: string;
    };
}

export interface WalletData {
    wallet_balance: string;
    transactions: {
        current_page: number;
        data: WalletTransaction[];
        total?: number;
        per_page?: number;
        last_page?: number;
    };
}

export interface GetWalletParams {
    page?: number;
    per_page?: number;
}

export interface GetWalletResponse {
    status: string;
    data: WalletData;
}

export interface WalletTopupRequest {
    amount: number;
    description?: string;
    receipt?: any; // For file upload
}

export interface WalletTopupResponse {
    status: string;
    message: string;
}

export interface WalletInvestRequest {
    user_id: number;
    amount: number;
    total_months?: number;
}

export interface WalletInvestResponse {
    status: string;
    message: string;
    data: {
        id: number;
        amount: number;
        status: string;
        next_payout_date: string;
    };
}

// ADMIN WALLET REQUEST TYPES

export interface WalletRequest {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    amount: string;
    status: 'pending' | 'approved' | 'rejected';
    type?: string;
    description: string;
    created_at: string;
    receipt?: string;
    receipt_image?: string;
}

export interface GetWalletRequestsResponse {
    status: string;
    data: {
        current_page: number;
        data: WalletRequest[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
}

export interface UpdateWalletAccessRequest {
    id: number;
    is_wallet_active: boolean;
}

export interface ApproveWalletRequest {
    id: number;
    action: 'approve' | 'reject';
}

export interface AdminWalletActionResponse {
    status: string;
    message: string;
}

export interface AdminWalletTopupRequest {
    user_id: number;
    amount: number;
    description: string;
}


export interface AdminWalletTopupResponse {
    status: string;
    message: string;
    data?: {
        wallet_balance: string;
        transaction_id: number;
    };
}
export interface TransferToReferralRequest {
    referral_id: number;
    amount: number;
    description?: string;
}

export interface TransferToReferralResponse {
    status: string;
    message: string;
    data?: {
        transaction_id: number;
        amount: string;
    };
}

export interface ActivateReferralRequest {
    referral_id: number;
    amount: number;
    total_months?: number;
}

export interface ActivateReferralResponse {
    status: string;
    message: string;
    data?: {
        investment_id: number;
        amount: string;
        status: string;
    };
}

export interface RefundReferralRequest {
    investment_id: number;
}

export interface RefundReferralResponse {
    status: string;
    message: string;
}

// KYC TYPES
export interface KycField {
    id: number;
    name: string;
    label: string;
    type: 'text' | 'file' | 'date' | 'number';
    is_required: boolean;
    options?: string[];
}

export interface GetKycFieldsResponse {
    status: string;
    data: KycField[];
}

export interface CreateKycFieldRequest {
    name: string;
    label: string;
    type: string;
    is_required: boolean;
}

export interface UpdateKycFieldRequest {
    id: number;
    name?: string;
    label?: string;
    type?: string;
    is_required?: boolean;
}

export interface KycSubmission {
    id: number;
    user_id: number;
    user_name?: string;
    user_email?: string;
    status: 'pending' | 'approved' | 'rejected';
    data: Record<string, string>;
    submitted_at: string;
    reviewed_at?: string;
    rejection_reason?: string;
}

export interface SubmitKycResponse {
    status: string;
    message: string;
    data?: KycSubmission;
}

export interface GetKycStatusResponse {
    status: string;
    data: {
        status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
        submission?: KycSubmission;
        message?: string;
        fields?: KycField[];
    };
}

export interface GetKycSubmissionsResponse {
    status: string;
    data: KycSubmission[];
}

export interface UpdateKycStatusRequest {
    id: number;
    status: 'approved' | 'rejected';
    rejection_reason?: string;
}

export interface UpdateKycStatusResponse {
    status: string;
    message: string;
    data: KycSubmission;
}
// NOTIFICATION TYPES
export interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        title: string;
        body: string;
        data?: any;
    };
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface NotificationResponse {
    status: string;
    data: {
        current_page: number;
        data: Notification[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
}

export interface GetNotificationsParams {
    page?: number;
    per_page?: number;
}
