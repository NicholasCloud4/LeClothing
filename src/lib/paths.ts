/** Only same-site relative paths are accepted as post-login destinations (no open redirects). */
export function safeNextPath(value: unknown, fallback = "/account") {
  if (typeof value !== "string") return fallback;
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : fallback;
}
