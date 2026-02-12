/**
 * Maps technical errors to user-friendly messages for display in toasts and UI.
 */
export function toUserMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("electron api not available")) {
      return "App is not fully loaded. Please refresh.";
    }
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("connection") || msg.includes("connection refused")) {
      return "Network error. Check your connection and ensure the analysis backend is running.";
    }
    if (msg.includes("failed with status 404")) {
      return "Backend not found. Is the analysis service running?";
    }
    if (msg.includes("failed with status 5")) {
      return "Server error. Please try again later.";
    }
    if (msg.includes("exceeds the maximum")) {
      return "File too large. Maximum size is 20 MB.";
    }
    if (msg.includes("invalid file") || msg.includes("file not found")) {
      return "Invalid or missing file.";
    }
    if (msg.includes("aborted") || msg.includes("abort")) {
      return "Operation cancelled.";
    }
    return err.message;
  }
  return "An unexpected error occurred.";
}
