// Display only: retain the original score for calculations and persistence.
export function formatEvidenceScore(value) {
  return Number.isFinite(value) ? Number.isInteger(value) ? String(value) : value.toFixed(1) : 'Not available';
}
export const evidenceLevels={low_evidence:'Low Evidence',basic_evidence:'Basic Evidence',good_evidence:'Good Evidence',high_evidence:'High Evidence',very_high_evidence:'Very High Evidence'};
