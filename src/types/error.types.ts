// ============================================
// Error Codes
// ============================================

export const ErrorCode = {
  // Validation errors (400)
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_UUID: 'INVALID_UUID',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',

  // Resource errors (404)
  MEMBER_NOT_FOUND: 'MEMBER_NOT_FOUND',
  PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',
  MEMBERSHIP_NOT_FOUND: 'MEMBERSHIP_NOT_FOUND',
  CHECK_IN_NOT_FOUND: 'CHECK_IN_NOT_FOUND',

  // Conflict errors (409)
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  ACTIVE_MEMBERSHIP_EXISTS: 'ACTIVE_MEMBERSHIP_EXISTS',
  MEMBERSHIP_ALREADY_CANCELLED: 'MEMBERSHIP_ALREADY_CANCELLED',

  // Business logic errors (422)
  MEMBER_DELETED: 'MEMBER_DELETED',
  PLAN_INACTIVE: 'PLAN_INACTIVE',
  MEMBERSHIP_EXPIRED: 'MEMBERSHIP_EXPIRED',
  MEMBERSHIP_NOT_ACTIVE: 'MEMBERSHIP_NOT_ACTIVE',
  NO_ACTIVE_MEMBERSHIP: 'NO_ACTIVE_MEMBERSHIP',

  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// ============================================
// Error Details
// ============================================

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: ValidationErrorDetail[];
  stack?: string;
}

// ============================================
// HTTP Status Code Mapping
// ============================================

export const errorCodeToHttpStatus: Record<ErrorCode, number> = {
  // 400 Bad Request
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.INVALID_UUID]: 400,
  [ErrorCode.INVALID_DATE_RANGE]: 400,

  // 404 Not Found
  [ErrorCode.MEMBER_NOT_FOUND]: 404,
  [ErrorCode.PLAN_NOT_FOUND]: 404,
  [ErrorCode.MEMBERSHIP_NOT_FOUND]: 404,
  [ErrorCode.CHECK_IN_NOT_FOUND]: 404,

  // 409 Conflict
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 409,
  [ErrorCode.ACTIVE_MEMBERSHIP_EXISTS]: 409,
  [ErrorCode.MEMBERSHIP_ALREADY_CANCELLED]: 409,

  // 422 Unprocessable Entity
  [ErrorCode.MEMBER_DELETED]: 422,
  [ErrorCode.PLAN_INACTIVE]: 422,
  [ErrorCode.MEMBERSHIP_EXPIRED]: 422,
  [ErrorCode.MEMBERSHIP_NOT_ACTIVE]: 422,
  [ErrorCode.NO_ACTIVE_MEMBERSHIP]: 422,

  // 500 Internal Server Error
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
};
