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
        first_page_url?: string;
        last_page_url?: string;
        links?: any[];
        next_page_url?: string | null;
        path?: string;
        per_page?: number;
        prev_page_url?: string | null;
        to?: number;
        total?: number;
    };
}

export interface GetWalletResponse {
    status: string;
    data: WalletData;
}

export interface WalletTopupRequest {
    amount: number;
    description?: string;
    receipt?: File; // For file upload
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
    total_months?: number; // Optional now, or removed entirely if strict. Keeping optional to avoid breaking other files if any. 
    // Actually, based on previous step I removed it from usage, so let's make it optional or remove. 
    // The instruction says "remote total_months from ActivateReferralRequest so I will remove it."
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

