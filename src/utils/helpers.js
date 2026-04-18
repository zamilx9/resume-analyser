/**
 * Generic API Response Wrapper
 */
export function successResponse(data, message = "Success", statusCode = 200) {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(error, message = "Error", statusCode = 400) {
  return {
    success: false,
    statusCode,
    message,
    error: error instanceof Error ? error.message : error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Extract user info from request headers (set by middleware)
 */
export function getUserFromRequest(request) {
  return {
    userId: request.headers.get("x-user-id"),
    role: request.headers.get("x-user-role"),
    email: request.headers.get("x-user-email"),
  };
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain number" };
  }
  return { valid: true };
}

/**
 * Check if user has required role
 */
export function hasRole(userRole, requiredRole) {
  const roleHierarchy = {
    ADMIN: 3,
    PREMIUM_USER: 2,
    USER: 1,
  };

  return (
    roleHierarchy[userRole] >= roleHierarchy[requiredRole] ||
    userRole === "ADMIN"
  );
}

/**
 * Safe JSON parse
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pagination helper
 */
export function getPaginationParams(query) {
  const page = Math.max(parseInt(query.page || "1"), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "10"), 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * File size validation
 */
export function validateFileSize(fileSizeInBytes, maxSizeMB = 10) {
  const maxSizeInBytes = maxSizeMB * 1024 * 1024;
  return fileSizeInBytes <= maxSizeInBytes;
}

/**
 * File type validation for resumes
 */
export function validateResumeFileType(fileName) {
  const allowedTypes = ["pdf", "doc", "docx"];
  const fileExtension = fileName.split(".").pop().toLowerCase();
  return allowedTypes.includes(fileExtension);
}
