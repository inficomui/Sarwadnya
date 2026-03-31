// REFERRAL & TREE TYPES

export interface TreeLevelInfo {
    total: number;
    active: number;
    inactive: number;
    level_no: number;
    unlocked: boolean;
    is_active: boolean;
}

export interface TreeSummaryResponse {
    status: string;
    data: {
        summary: {
            total_team: number;
            total_active: number;
            total_inactive: number;
            total_team_investment: number;
            total_direct_investment: number;
            unlocked_levels: number;
        };
        levels: Record<string, TreeLevelInfo>;
    };
}

export interface LevelStatusItem {
    level: number;
    is_unlocked: boolean;
    required_business: number;
    current_team_business: number;
    status: string;
    description: string;
}

export interface LevelStatusResponse {
    status: string;
    data: {
        user_id: number;
        has_active_investment: boolean;
        total_team_business: number;
        unlocked_levels: number;
        levels: Record<string, LevelStatusItem>;
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
    parent_id?: number | null;
    name: string;
    email: string;
    phone_number: string;
    role?: string;
    referral_code?: string;
    referred_by?: string;
    email_verified_at?: string | null;
    view_password?: string;
    status?: string;
    wallet_balance?: string;
    is_wallet_active?: boolean;
    created_at: string;
    updated_at?: string;
    investment?: number;
    total_investment?: string | number;
    commission?: number;
    commission_earned?: string | number;
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
        level_wise_earnings: Record<string, number>;
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
