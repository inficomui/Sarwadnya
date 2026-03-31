// Validation schemas for user authentication forms
// Path: client/lib/validations/authSchemas.ts

import * as z from "zod";

/**
 * Login Form Schema
 * Matches the payload for /api/user/login
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Referral ID is required")
        .min(3, "Please enter a valid Referral ID"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must not exceed 100 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration Form Schema
 * Matches the payload for /api/register
 */
export const registerSchema = z
    .object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name must not exceed 100 characters")
            .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Please enter a valid email address"),
        phone_number: z
            .string()
            .min(10, "Phone number must be 10 digits")
            .max(10, "Phone number must be 10 digits")
            .regex(/^[0-9]{10}$/, "Phone number must contain only digits"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password must not exceed 100 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            ),
        password_confirmation: z
            .string()
            .min(6, "Password confirmation is required"),
        referral_code: z
            .string()
            .optional()
            .or(z.literal("")),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z
    .object({
        email: z
            .string()
            .min(1, "Email is required")
            .email("Please enter a valid email address"),
        otp: z
            .string()
            .min(6, "OTP must be 6 digits")
            .max(6, "OTP must be 6 digits")
            .regex(/^[0-9]{6}$/, "OTP must contain only digits"),
        newPassword: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password must not exceed 100 characters"),
        confirmPassword: z
            .string()
            .min(6, "Password confirmation is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
