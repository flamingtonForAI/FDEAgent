/**
 * jsonUtils.ts - Shared JSON extraction utility
 *
 * Extract JSON from AI responses that may be wrapped in markdown code fences.
 */

/**
 * Extract JSON from a response that may be wrapped in markdown code fences.
 * Tries in order: raw '{' prefix → ```json fence → first { ... } block → original text.
 */
export function extractJSON(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return trimmed;
  // Extract from ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Fallback: extract first { ... } block
  const braceMatch = trimmed.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];
  return trimmed;
}
