// Response Normalization Utility for Admin Frontend
// This utility handles inconsistent API responses from the backend
// without requiring changes to individual API calls

/**
 * Normalize API response data to consistent format
 * @param {any} response - Raw API response
 * @param {string} endpointType - Type of endpoint (directory, news, social, etc.)
 * @returns {any} Normalized response data
 */
export const normalizeResponse = (response, endpointType = null) => {
  // If response is already in standard format, return as-is
  if (response && response.success !== undefined) {
    return response.data || response;
  }
  
  // Consolidate response handling
  if (endpointType === 'pagination') {
    return normalizePaginationResponse(response);
  }
  
  // Directory, news, and social endpoints often return similar structures
  if (['directory', 'news', 'social'].includes(endpointType)) {
    return normalizeListResponse(response);
  }
  
  // Default normalization for other endpoints
  return normalizeGenericResponse(response);
};

/**
 * Normalize list-based responses (sponsors, exhibitors, users, posts)
 */
const normalizeListResponse = (response) => {
  if (!response) return [];
  
  // Handle raw array responses
  if (Array.isArray(response)) {
    return response;
  }
  
  // Handle wrapped responses
  if (response && typeof response === 'object') {
    // Check common list property names
    const listProperties = ['sponsors', 'exhibitors', 'users', 'posts', 'data'];
    for (const prop of listProperties) {
      if (response[prop] && Array.isArray(response[prop])) {
        return response[prop];
      }
    }
  }
  
  return response;
};

/**
 * Normalize pagination responses
 */
const normalizePaginationResponse = (response) => {
  if (!response) return { data: [], pagination: null };
  
  // Handle standard format
  if (response.success !== undefined && response.data) {
    return {
      data: response.data,
      pagination: response.pagination || null
    };
  }
  
  // Handle wrapped format
  if (response.data && response.pagination) {
    return {
      data: response.data,
      pagination: response.pagination
    };
  }
  
  // Handle raw array (no pagination)
  if (Array.isArray(response)) {
    return {
      data: response,
      pagination: null
    };
  }
  
  return {
    data: response || [],
    pagination: null
  };
};

/**
 * Generic response normalization
 */
const normalizeGenericResponse = (response) => {
  if (!response) return null;
  
  // Handle raw array responses
  if (Array.isArray(response)) {
    return response;
  }
  
  // Handle single object responses
  if (response && typeof response === 'object') {
    return response;
  }
  
  return response;
};

/**
 * Normalize error responses
 */
export const normalizeError = (error) => {
  if (!error) return { message: "An error occurred" };
  
  // Handle standard error format
  if (error.success === false && error.message) {
    return {
      message: error.message,
      errors: error.errors || null
    };
  }
  
  // Handle raw error objects
  if (error.message) {
    return {
      message: error.message,
      errors: error.errors || null
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      errors: null
    };
  }
  
  return {
    message: "An unexpected error occurred",
    errors: null
  };
};

/**
 * Create a wrapper for TanStack Query to handle response normalization
 */
export const createNormalizedQuery = (queryKey, queryFn, endpointType = null) => {
  return {
    queryKey,
    queryFn: async () => {
      try {
        const response = await queryFn();
        const normalizedData = normalizeResponse(response, endpointType);
        return normalizedData;
      } catch (error) {
        const normalizedError = normalizeError(error);
        throw new Error(normalizedError.message);
      }
    }
  };
};

/**
 * Create a wrapper for TanStack Mutation to handle response normalization
 */
export const createNormalizedMutation = (mutationFn, endpointType = null) => {
  return {
    mutationFn: async (variables) => {
      try {
        const response = await mutationFn(variables);
        const normalizedData = normalizeResponse(response, endpointType);
        return normalizedData;
      } catch (error) {
        const normalizedError = normalizeError(error);
        throw new Error(normalizedError.message);
      }
    }
  };
};

/**
 * Utility to check if response is in standard format
 */
export const isStandardResponse = (response) => {
  return response && typeof response === 'object' && response.success !== undefined;
};

/**
 * Utility to extract data from response regardless of format
 */
export const extractData = (response, fallback = null) => {
  if (!response) return fallback;
  
  // If already in standard format
  if (isStandardResponse(response)) {
    return response.data || fallback;
  }
  
  // If raw array or object
  return response;
};