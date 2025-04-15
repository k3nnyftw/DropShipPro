import { ZodSchema, z } from "zod";
import { toast } from "@/hooks/use-toast";
import { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * Enhanced validation schemas with better error messages
 */

// Email validation with detailed error messages
export const emailSchema = z
  .string()
  .min(1, { message: "Email is required" })
  .email({
    message: "Please enter a valid email address (e.g. name@example.com)"
  });

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" });

// URL validation
export const urlSchema = z
  .string()
  .min(1, { message: "URL is required" })
  .url({ message: "Please enter a valid URL (e.g. https://example.com)" });

// Phone number validation (simple format)
export const phoneSchema = z
  .string()
  .min(1, { message: "Phone number is required" })
  .regex(/^\+?[0-9\s\-()]{10,20}$/, {
    message: "Please enter a valid phone number (e.g. +1 555-123-4567)"
  });

// Price validation
export const priceSchema = z
  .string()
  .min(1, { message: "Price is required" })
  .regex(/^\d+(\.\d{1,2})?$/, {
    message: "Please enter a valid price (e.g. 19.99)"
  })
  .transform((val) => parseFloat(val));

// Helper to handle form submission errors gracefully
export function handleFormError(error: unknown) {
  // Log the error for debugging
  console.error("Form error:", error);
  
  // Provide a user-friendly error message
  toast({
    title: "Error submitting form",
    description: error instanceof Error 
      ? error.message 
      : "An unexpected error occurred. Please try again.",
    variant: "destructive"
  });
}

// Function to extract server-side validation errors and add them to form state
export function applyServerValidationErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: any
) {
  // Check if the error contains field-specific validation errors
  if (error?.errorData?.validationErrors) {
    const validationErrors = error.errorData.validationErrors;
    
    // Apply each validation error to the form state
    Object.entries(validationErrors).forEach(([field, message]) => {
      form.setError(field as any, {
        type: "server",
        message: message as string
      });
    });
    
    return true; // Errors were applied
  }
  
  return false; // No validation errors found
}

// Function to create a form submission handler with automatic error handling
export function createSubmitHandler<T extends FieldValues>(
  form: UseFormReturn<T>,
  onSubmit: (data: T) => Promise<void> | void,
  options?: {
    onError?: (error: unknown) => void;
    onSuccess?: () => void;
  }
) {
  return async (data: T) => {
    try {
      await onSubmit(data);
      options?.onSuccess?.();
    } catch (error) {
      // Try to apply server validation errors to form fields
      const appliedErrors = applyServerValidationErrors(form, error);
      
      // If no field-specific errors, handle the error generally
      if (!appliedErrors) {
        if (options?.onError) {
          options.onError(error);
        } else {
          handleFormError(error);
        }
      }
    }
  };
}