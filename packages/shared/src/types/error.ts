// ---------------------------------------------------------------------------
// Common API error shape
// ---------------------------------------------------------------------------

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

export interface ValidationError extends ApiError {
  /** Per-field validation issues. */
  issues?: { path: string; message: string }[];
}
