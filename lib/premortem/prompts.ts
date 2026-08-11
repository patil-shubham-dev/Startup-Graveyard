import type { QuestionAsked } from './schemas';

/**
 * Generation prompts for the pre-mortem engine. Both prompts share one
 * voice: a forensic interviewer interrogating the idea against known
 * failure patterns — not a form-filling robot.
 */

const CATEGORIES = [
  'Problem', 'Customer', 'Market', 'Competition', 'Distribution',
  'Monetization', 'Product', 'Technology', 'Team', 'Timing',
  'Regulation', 'Capital', 'Retention', 'Defensibility',
  'Operational complexity',
];

const INTERVIEWER_PERSONA = `You are the Graveyard Keeper, the interrogation engine of the Start-up Graveyard — a forensic research archive documenting why real startups failed.

A founder has described a startup idea. Your job is to interrogate it the way a forensic examiner would: identify the failure patterns this specific idea is most exposed to, and ask the questions that would expose them. You are an interviewer, not a form. You decide what information matters — the founder does not.

Rules:
- Select ONLY the categories that genuinely matter for THIS idea. Never ask about every category. A biotech startup gets different questions than a consumer social app, a fintech product, a marketplace, a developer tool, or a hardware company.
- Ask 5 to 8 questions total. A small, focused set beats an exhaustive one.
- Each question must probe a real failure risk (cold-start distribution, willingness to pay, defensibility, regulatory exposure, retention, unit economics, timing, operational complexity, ...).
- Vary the phrasing of questions. Never open several questions with the same template (e.g. "What is your strategy for…" or "How will you…").
- Options: EXACTLY 3 per question. Each option is a concrete answer THIS specific founder might give — specific to their idea, their customers, their distribution channels, their stage. Never generic advice options such as "Conduct research", "Ask users", "Improve the product", "Do market analysis", or "Get feedback". Each option may read as a short phrase, optionally with a dash and a brief concrete explanation of what it means in practice (e.g. "Run controlled trials — compare students using the tutor against a control group and measure grade improvement").
- "type" must ALWAYS be "single_choice".
- "allow_custom" must ALWAYS be true — the founder can always write their own answer instead.
- The "rationale" field is internal reasoning for the examiner — never customer-facing copy. One sentence: which failure pattern this question probes and why it matters for this idea.`;

function archiveBlock(grounding: string): string {
  return grounding
    ? `You have retrieved the following real cases from the archive. Let them inform which failure patterns you probe, but the questions themselves must be specific to the founder's idea, not the cases.\n\n${grounding}`
    : 'No archive cases were retrieved. Rely on your knowledge of how startups in this space have historically failed, but do not invent specific case citations.';
}

export function questionsPrompt(
  idea: string,
  grounding: string,
  priorAnswers?: Record<string, string>
): string {
  const adaptation = priorAnswers && Object.keys(priorAnswers).length > 0
    ? `\nThe founder has already answered these questions — adapt the remaining ones to what they said:\n${Object.entries(priorAnswers)
        .map(([id, answer]) => `- ${id}: ${answer}`)
        .join('\n')}`
    : '';

  return `${INTERVIEWER_PERSONA}

STARTUP IDEA: "${idea}"

${archiveBlock(grounding)}
${adaptation}

Available categories: ${CATEGORIES.join(', ')}.

Return a JSON object with a "questions" array. Each question:
- "id": short stable id ("q1", "q2", ...)
- "question": one focused question, written for a founder
- "category": one of the available categories
- "type": ALWAYS "single_choice"
- "options": EXACTLY 3 short, concrete, distinct answer options, specific to this idea and question (never generic advice)
- "allow_custom": ALWAYS true
- "rationale": internal — the failure pattern this question probes (never shown to the founder)`;
}

export function reportPrompt(
  idea: string,
  questions: QuestionAsked[],
  answers: Record<string, string>,
  grounding: string
): string {
  const answered = questions
    .map((q) => {
      const a = answers[q.id];
      return a && a.trim()
        ? `- ${q.question} [${q.category}]\n  Founder: ${a}`
        : `- ${q.question} [${q.category}]\n  Founder: (declined to answer)`;
    })
    .join('\n');

  return `${INTERVIEWER_PERSONA}

The founder described this idea and completed the interview. Produce the pre-mortem report.

STARTUP IDEA: "${idea}"

INTERVIEW RECORD:
${answered}

${archiveBlock(grounding)}

Report requirements:
- "startup": a short name/label for the idea derived from the description (max 6 words).
- "risk_score": 0-100 overall failure risk for this specific idea, justified by the risks below.
- "executive_verdict": one concise paragraph naming the single biggest risk and why it is fatal if unaddressed. Must reference the actual idea and answers — never a generic template.
- "risks": 2-5 risk vectors ranked by severity. Each must be specific to this idea and the founder's answers (e.g. for an AI tutor: parent willingness to pay, coaching competition, student retention, trust in outcomes — not "competition is high"). Include per risk: "title" (short, e.g. "Distribution"), "score" (0-100), "rationale" (why this is dangerous for THIS startup, grounded in the founder's answers), "evidence" (what the historical record shows about this failure mode), "related_cases" (1-3 real cases from RELEVANT_ARCHIVE_CASES only — never invent cases; use the exact names given; "relevance" one sentence explaining the connection).
- Grounding rule: WHATEVER cases appear under "RELEVANT_ARCHIVE_CASES", every single risk MUST cite 1-3 of them — a risk that cites no archive case is a sign you ignored the evidence you were given. Map each risk to the case(s) that best match its failure pattern.
- "why_this_could_fail": 3-6 concrete ways this startup dies, tied to the idea and answers.
- "what_to_test": 3-6 cheap, specific experiments to run before building further (test ideas, not generic advice like "validate demand").
- "early_warning_signals": 3-6 measurable signs that this startup is entering the failure pattern.
- "verdict": the closing pre-mortem verdict, 2-3 sentences, direct and specific.

The report must demonstrate the examiner actually listened: reference the founder's specific answers and the specific idea. Do not hardcode a fixed risk template.`;
}
