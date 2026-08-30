export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "An unexpected server error occurred.";
}

export function isDemoUser(username: string) {
  return username.trim().toLowerCase() === "demo";
}
