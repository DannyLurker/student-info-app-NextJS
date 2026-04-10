/**
 * Abbreviates a name based on the specified depth.
 * @param name - The full name string.
 * @param limit - How many parts of the name should remain full before abbreviating.
 */
export function abbreviateName(name: string, limit: 1 | 2 = 1): string {
  const parts = name.trim().split(/\s+/);

  // 1. Edge case: Empty string
  if (parts.length === 0 || !parts[0]) return "";

  // 2. Edge case: Name has fewer parts than the limit
  if (parts.length <= limit) return parts.join(" ");

  // 3. Logic for Limit 1: "Victor Raf Yeager" -> "Victor R"
  if (limit === 1) {
    const firstName = parts[0];
    const secondInitial = parts[1][0].toUpperCase();
    return `${firstName} ${secondInitial}`;
  }

  // 4. Logic for Limit 2: "Victor Raf Yeager" -> "Victor Raf Y"
  if (limit === 2) {
    const firstTwoParts = parts.slice(0, 2).join(" ");
    const thirdInitial = parts[2] ? parts[2][0].toUpperCase() : "";
    return thirdInitial ? `${firstTwoParts} ${thirdInitial}` : firstTwoParts;
  }

  return parts[0];
}
