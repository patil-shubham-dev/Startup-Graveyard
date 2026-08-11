const GENERIC: string[] = [
  "What failure pattern does this case represent?",
  "What should a founder have watched for before the collapse?",
  "Which other companies in the archive followed the same path?",
];

/** Deterministic follow-up suggestions derived from the last inquiry.
 *  No generation, no randomness: same question, same suggestions. */
export function buildFollowUps(lastQuestion: string): string[] {
  const q = lastQuestion.trim().replace(/\s+/g, " ");
  if (!q) return GENERIC;
  const match =
    q.match(/why\s+(?:did|does|was|were|is)\s+(.+?)\s+(?:fail|collapse|die|fold|implode|shut\s+down|doomed|go\s+bankrupt)[?!.]*$/i) ??
    q.match(/why\s+(?:did|does|was|were|is)\s+(.+?)[?!.]*$/i);
  if (!match || !match[1]) return GENERIC;
  const subject = match[1].replace(/[?!.]+$/, "").trim();
  if (!subject || subject.length > 80) return GENERIC;
  return [
    `What did ${subject} underestimate?`,
    "Was the business model fundamentally broken?",
    `How did competitors respond to ${subject}'s collapse?`,
    `Which other companies made the same mistake as ${subject}?`,
  ];
}
