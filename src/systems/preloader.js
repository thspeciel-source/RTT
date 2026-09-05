/**
 * Pre-response cache: each LLM response ships 4 pre-computed follow-ups,
 * one per player_option. Tapping an option should hit this cache instantly
 * instead of waiting on a fresh network round-trip.
 */
export function createPreloadCache() {
  let cache = null; // { "0": validatedResponse, "1": ..., "2": ..., "3": ... }

  return {
    set(preResponses) {
      cache = preResponses;
    },
    get(optionIndex) {
      return cache ? cache[String(optionIndex)] : undefined;
    },
    clear() {
      cache = null;
    },
    hasAny() {
      return !!cache;
    }
  };
}
