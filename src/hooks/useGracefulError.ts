import { toast } from 'sonner';

interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Graceful error handling with automatic retry logic
 */
export async function withGracefulError<T>(
  operation: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | null> {
  const {
    maxRetries = 1,
    retryDelay = 1000,
    showToast = true,
    onError,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      console.error(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, lastError);

      // If not last attempt, wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // Last attempt failed
      if (showToast) {
        toast.error('Network error', {
          description: 'Please check your connection and try again.',
        });
      }

      if (onError) {
        onError(lastError);
      }

      return null;
    }
  }

  return null;
}

/**
 * Hook for wrapping async operations with error handling
 */
export function useGracefulError() {
  return { withGracefulError };
}
