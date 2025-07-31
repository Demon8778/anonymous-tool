// API configuration constants
export const API_CONFIG = {
  // External API endpoints
  TENOR: {
    BASE_URL: 'https://tenor.googleapis.com/v2',
    SEARCH_ENDPOINT: '/search',
    DEFAULT_LIMIT: 20 as number,
    MAX_LIMIT: 50 as number,
  },
  
  GIPHY: {
    BASE_URL: 'https://api.giphy.com/v1/gifs',
    SEARCH_ENDPOINT: '/search',
    DEFAULT_LIMIT: 20 as number,
    MAX_LIMIT: 50 as number,
  },
  
  // Internal API endpoints
  INTERNAL: {
    SEARCH_GIFS: '/api/search-gifs',
    PROCESS_GIF: '/api/process-gif',
    SHARE_GIF: '/api/share',
    HEALTH: '/api/health',
  },
  
  // Request timeouts
  TIMEOUTS: {
    search: 10000, // 10 seconds
    processing: 300000, // 5 minutes
    sharing: 5000, // 5 seconds
  },
  
  // Retry configuration
  RETRY: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
  },
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Error messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Network connection failed',
  TIMEOUT_ERROR: 'Request timeout exceeded',
  RATE_LIMIT_ERROR: 'Rate limit exceeded',
  VALIDATION_ERROR: 'Invalid request data',
  SERVER_ERROR: 'Internal server error',
  NOT_FOUND_ERROR: 'Resource not found',
  UNAUTHORIZED_ERROR: 'Unauthorized access',
} as const;