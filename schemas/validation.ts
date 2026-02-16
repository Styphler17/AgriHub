import { z } from 'zod';

/**
 * User Profile Validation Schema
 */
export const userProfileSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

    location: z.string()
        .min(2, 'Location must be at least 2 characters')
        .max(100, 'Location must not exceed 100 characters'),

    phoneNumber: z.string()
        .regex(/^(\+233|0)[2-9]\d{8}$/, 'Invalid Ghana phone number format (e.g., +233241234567 or 0241234567)')
        .optional()
        .or(z.literal('')),

    role: z.enum(['farmer', 'buyer', 'extension-officer'], {
        errorMap: () => ({ message: 'Role must be farmer, buyer, or extension-officer' })
    }),

    profileImage: z.string().url('Invalid image URL').optional().or(z.literal(''))
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

/**
 * Marketplace Listing Validation Schema
 */
export const marketplaceListingSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must not exceed 100 characters'),

    description: z.string()
        .min(20, 'Description must be at least 20 characters')
        .max(500, 'Description must not exceed 500 characters'),

    price: z.string()
        .regex(/^GH₵?\s?\d+(\.\d{1,2})?$/, 'Price must be in format: GH₵100 or 100.00'),

    type: z.enum(['sale', 'wanted'], {
        errorMap: () => ({ message: 'Type must be either "sale" or "wanted"' })
    }),

    category: z.string()
        .min(2, 'Category is required')
        .max(50, 'Category must not exceed 50 characters'),

    location: z.string()
        .min(2, 'Location is required')
        .max(100, 'Location must not exceed 100 characters'),

    contact: z.string()
        .regex(/^(\+233|0)[2-9]\d{8}$/, 'Invalid Ghana phone number format')
});

export type MarketplaceListingInput = z.infer<typeof marketplaceListingSchema>;

/**
 * Market Price Update Validation Schema
 */
export const priceUpdateSchema = z.object({
    commodity: z.string()
        .min(2, 'Commodity name is required')
        .max(50, 'Commodity name must not exceed 50 characters'),

    price: z.number()
        .positive('Price must be greater than 0')
        .max(100000, 'Price seems unreasonably high'),

    unit: z.string()
        .min(2, 'Unit is required (e.g., kg, bag, crate)')
        .max(20, 'Unit must not exceed 20 characters'),

    location: z.string()
        .min(2, 'Location is required')
        .max(100, 'Location must not exceed 100 characters'),

    trend: z.enum(['up', 'down', 'stable'], {
        errorMap: () => ({ message: 'Trend must be up, down, or stable' })
    })
});

export type PriceUpdateInput = z.infer<typeof priceUpdateSchema>;

/**
 * Authentication (Phone Number) Validation Schema
 */
export const authPhoneSchema = z.object({
    phoneNumber: z.string()
        .regex(/^(\+233|0)[2-9]\d{8}$/, 'Please enter a valid Ghana phone number (e.g., +233241234567 or 0241234567)')
});

export type AuthPhoneInput = z.infer<typeof authPhoneSchema>;

/**
 * OTP Validation Schema
 */
export const otpSchema = z.object({
    otp: z.string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only numbers')
});

export type OTPInput = z.infer<typeof otpSchema>;

/**
 * Crop Advice Request Validation Schema
 */
export const cropAdviceSchema = z.object({
    crop: z.string()
        .min(2, 'Crop name is required')
        .max(50, 'Crop name must not exceed 50 characters'),

    soilType: z.string()
        .min(2, 'Soil type is required')
        .max(50, 'Soil type must not exceed 50 characters'),

    region: z.string()
        .min(2, 'Region is required')
        .max(50, 'Region must not exceed 50 characters')
});

export type CropAdviceInput = z.infer<typeof cropAdviceSchema>;

/**
 * Helper function to format Zod errors for display
 */
export function formatZodErrors(error: z.ZodError): string[] {
    return error.errors.map(err => err.message);
}

/**
 * Helper function to get first error message
 */
export function getFirstError(error: z.ZodError): string {
    return error.errors[0]?.message || 'Validation failed';
}

/**
 * Safe validation wrapper that returns { success, data, errors }
 */
export function safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    } else {
        return { success: false, errors: formatZodErrors(result.error) };
    }
}
