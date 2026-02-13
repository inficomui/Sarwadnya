// ADMIN TYPES
import { User } from './user';

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    referral_code: string;
    created_at: string;
    updated_at: string;
    role?: string;
}

export interface AdminLoginRequest {
    email: string;
    password: string;
}

export interface AdminLoginResponse {
    status: string;
    message: string;
    data: {
        user: AdminUser;
        access_token: string;
        token_type: string;
    };
}

export interface AdminDashboardResponse {
    status: string;
    data: {
        metrics: {
            total_users: number;
            total_revenue: number;
            active_investments_count: number;
            pending_withdrawals_count: number;
        };
        revenue_chart_data: {
            name: string;
            value: number;
        }[];
        recent_users: User[];
    };
}

export interface SendNotificationRequest {
    user_id?: number | null;
    title: string;
    body: string;
}
