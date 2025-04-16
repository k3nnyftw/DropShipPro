import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Form validation utilities to streamline validation across the application
 */

/**
 * Common validation patterns
 */
export const validationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  url: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
  phone: /^\+?[0-9]{10,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  postalCode: /^[0-9]{5}(-[0-9]{4})?$/,
  currencyValue: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  alphanumeric: /^[a-zA-Z0-9]*$/,
  numeric: /^[0-9]*$/,
  alphabetic: /^[a-zA-Z]*$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

/**
 * Common validation error messages
 */
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL (starting with http:// or https://)',
  phone: 'Please enter a valid phone number',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be at most ${max} characters`,
  passwordRequirements: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
  mustMatch: (field: string) => `Must match ${field}`,
  invalidFormat: 'Invalid format',
  minimumValue: (min: number) => `Must be at least ${min}`,
  maximumValue: (max: number) => `Must be at most ${max}`,
  integer: 'Must be a whole number',
  positiveNumber: 'Must be a positive number',
  currencyValue: 'Must be a valid currency amount (e.g., 10.99)',
  fileSize: (maxSizeMB: number) => `File size must be less than ${maxSizeMB}MB`,
  fileType: (types: string[]) => `File must be of type: ${types.join(', ')}`,
  alphanumeric: 'Only letters and numbers are allowed',
  numeric: 'Only numbers are allowed',
  alphabetic: 'Only letters are allowed',
  slug: 'Only lowercase letters, numbers, and hyphens are allowed',
};

/**
 * Common Zod schemas for form validation
 */
export const validationSchemas = {
  email: z.string().email(validationMessages.email),
  username: z.string().min(3, validationMessages.minLength(3)).max(30, validationMessages.maxLength(30)),
  password: z.string().min(8, validationMessages.minLength(8)).regex(validationPatterns.password, validationMessages.passwordRequirements),
  // Special handling for password confirmation
  confirmPassword: (passwordFieldName: string = 'password') => 
    z.string().refine(
      (val) => true, // Initial validation always passes
      { message: validationMessages.mustMatch('password') }
    ).refine(
      (val, ctx) => {
        if (typeof ctx.data === 'object' && ctx.data !== null) {
          const data = ctx.data as Record<string, any>;
          return val === data[passwordFieldName];
        }
        return false;
      },
      { message: validationMessages.mustMatch('password') }
    ),
  name: z.string().min(2, validationMessages.minLength(2)).max(50, validationMessages.maxLength(50)),
  phone: z.string().regex(validationPatterns.phone, validationMessages.phone),
  url: z.string().regex(validationPatterns.url, validationMessages.url),
  price: z.string().regex(validationPatterns.currencyValue, validationMessages.currencyValue),
  quantity: z.number().int(validationMessages.integer).min(1, validationMessages.minimumValue(1)),
  postalCode: z.string().regex(validationPatterns.postalCode, validationMessages.invalidFormat),
  numericString: z.string().regex(validationPatterns.numeric, validationMessages.numeric),
  alphanumericString: z.string().regex(validationPatterns.alphanumeric, validationMessages.alphanumeric),
  slug: z.string().regex(validationPatterns.slug, validationMessages.slug),
};

/**
 * Get resolver for react-hook-form
 * @param schema - Zod schema to use for validation
 * @returns Resolver for useForm
 */
export function getZodResolver<T extends z.ZodType>(schema: T) {
  return zodResolver(schema);
}

/**
 * Custom validator to check if a file size is within limits
 * @param maxSizeMB - Maximum file size in MB
 * @returns Zod validation function
 */
export function validateFileSize(maxSizeMB: number) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return (file: File) => ({
    success: file.size <= maxSizeBytes,
    error: file.size > maxSizeBytes ? validationMessages.fileSize(maxSizeMB) : undefined,
  });
}

/**
 * Custom validator to check if a file type is allowed
 * @param allowedTypes - Array of allowed MIME types
 * @returns Zod validation function
 */
export function validateFileType(allowedTypes: string[]) {
  return (file: File) => ({
    success: allowedTypes.includes(file.type),
    error: !allowedTypes.includes(file.type) ? validationMessages.fileType(allowedTypes) : undefined,
  });
}

/**
 * Get human-readable error message from Zod validation errors
 * @param error - Zod error object
 * @returns Formatted error message
 */
export function getFormattedZodError(error: z.ZodError): string {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
}

/**
 * Transform Zod validation errors to form errors format for react-hook-form
 * @param zodErrors - Zod error object
 * @returns Record of field paths and error messages
 */
export function zodErrorsToFormErrors(zodErrors: z.ZodError) {
  const formErrors: Record<string, { message: string }> = {};
  
  zodErrors.errors.forEach(error => {
    const path = error.path.join('.');
    formErrors[path] = { message: error.message };
  });
  
  return formErrors;
}

/**
 * Combine multiple Zod schemas into one
 * @param schemas - Object with field names and corresponding Zod schemas
 * @returns Combined Zod schema
 */
export function combineSchemas<T extends Record<string, z.ZodType>>(schemas: T) {
  const entries = Object.entries(schemas);
  const shape = entries.reduce((acc, [key, schema]) => {
    acc[key] = schema;
    return acc;
  }, {} as Record<string, z.ZodType>);
  
  return z.object(shape);
}

/**
 * Create a validator function for async validation with react-hook-form
 * @param validationFn - Async validation function
 * @param errorMessage - Error message to display on validation failure
 * @returns Validator function for react-hook-form
 */
export function createAsyncValidator<T>(
  validationFn: (value: T) => Promise<boolean>,
  errorMessage: string
) {
  return async (value: T) => {
    const isValid = await validationFn(value);
    return isValid || errorMessage;
  };
}