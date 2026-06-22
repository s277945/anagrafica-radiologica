/**
 * Centralized query keys so invalidations are consistent across features.
 * Keep keys stable and serializable.
 */
export const queryKeys = {
  organizzazioneTree: (orgId: string) => ['organizzazioneTree', orgId] as const,
} as const
