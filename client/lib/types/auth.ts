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
