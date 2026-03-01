interface ApiError {
  success: boolean;
  message: string;
  errors?: Array<{
    type: string;
    value: string;
    msg: string;
    path: string;
    location: string;
  }>;
}

export const parseApiError = (error: any): string => {
  // If error is a string, return it directly
  if (typeof error === 'string') {
    return error;
  }

  // If error has a response (axios error)
  if (error?.response?.data) {
    const apiError: ApiError = error.response.data;
    
    // If there are specific field errors, format them nicely
    if (apiError.errors && apiError.errors.length > 0) {
      const fieldErrors = apiError.errors.map(err => err.msg).join(', ');
      return fieldErrors;
    }
    
    // Return the main message if available
    if (apiError.message) {
      return apiError.message;
    }
  }

  // If error has a message property
  if (error?.message) {
    return error.message;
  }

  // If error is an Error instance
  if (error instanceof Error) {
    return error.message;
  }

  // Default fallback message
  return 'An unexpected error occurred. Please try again.';
}; 