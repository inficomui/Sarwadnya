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
    company_support?: boolean;
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

// USER DASHBOARD TYPES
export interface UserDashboardResponse {
    status: string;
    data: {
        profile: {
            name: string;
            email: string;
            phone_number: string;
            kyc_status?: string;
            is_payout_restricted?: boolean;
            rank?: string;
            referral_code?: string;
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
            wallet_balance: string;
        };
        financials: {
            available_balance: number;
            total_deposited: number;
            total_withdrawn: number | string;
            active_investment: number;
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
            percentage?: number;
        };
        stats?: {
            total_team: number;
            direct_referrals: number;
        };
        notice?: string;
    };
}

// KYC TYPES

export interface KycField {
    id: number;
    label: string;
    name: string;
    type: 'text' | 'number' | 'file';
    required: boolean;
    order: number;
    created_at?: string;
    updated_at?: string;
}

export interface GetKycFieldsResponse {
    status: string;
    data: KycField[];
}

export interface CreateKycFieldRequest {
    label: string;
    name: string;
    type: 'text' | 'number' | 'file';
    required?: boolean;
    order?: number;
}

export interface UpdateKycFieldRequest {
    id: number;
    label?: string;
    type?: 'text' | 'number' | 'file';
    required?: boolean;
    order?: number;
}

export interface KycSubmissionData {
    status: 'pending' | 'approved' | 'rejected';
    admin_message: string | null;
    data: Record<string, any>;
    files: Record<string, string>;
}

export interface KycSubmission extends KycSubmissionData {
    id: number;
    user_id: number;
    user?: User;
    created_at: string;
    updated_at: string;
}

export interface GetKycStatusResponse {
    status: string;
    data: KycSubmissionData | null;
}

export interface SubmitKycResponse {
    status: string;
    message: string;
    data: KycSubmission;
}

export interface GetKycSubmissionsResponse {
    status: string;
    data: KycSubmission[];
}

export interface UpdateKycStatusRequest {
    id: number;
    status: 'approved' | 'rejected';
    admin_message?: string;
    // user_id?: number;//Removed as not in original but commonly needed
}

export interface UpdateKycStatusResponse {
    status: string;
    message: string;
    data: KycSubmission;
}
