import type { RelevanceDecision } from "./types.js";

const IN_SCOPE_WORK_TYPES = new Set([
  "rlhf-eval",
  "coding",
  "stem-math",
  "domain-expert",
  "agentic-eval",
  "data-labeling",
  "multilingual",
  "audio-speech",
  "writing",
  "red-teaming",
  "research-studies",
]);

const IN_SCOPE_TITLE =
  /\b(ai|rlhf|llm|annotat|evaluat|trainer|tutor|label|red[\s-]?team|prompt|rubric|preference|sft|alignment|data collect|transcription|linguist|expert data|model eval|coding eval|agent)\b/i;

const OUT_OF_SCOPE_CORPORATE =
  /\b(accountant|bookkeeper|controller|hr manager|recruiter|office manager|sales executive|account executive|customer success manager|devops engineer intern at headquarters)\b/i;

export function classifyRelevance(input: {
  title: string;
  workType?: string | null;
  workLabel?: string | null;
  platformSlug?: string | null;
}): RelevanceDecision {
  const workType = (input.workType || "").trim();
  const corporate = OUT_OF_SCOPE_CORPORATE.test(input.title);

  if (corporate && !IN_SCOPE_TITLE.test(input.title.replace(/\bai company\b/gi, ""))) {
    return {
      status: "REJECTED",
      reason: "Unrelated corporate role",
      confidence: "HIGH",
    };
  }

  if (workType && IN_SCOPE_WORK_TYPES.has(workType)) {
    if (OUT_OF_SCOPE_CORPORATE.test(input.title) && !IN_SCOPE_TITLE.test(input.title)) {
      return {
        status: "QUARANTINED",
        reason: "Corporate-looking title on an otherwise in-scope work type",
        confidence: "LOW",
      };
    }
    return {
      status: "ACCEPTED",
      reason: `In-scope work type ${workType}`,
      confidence: "HIGH",
    };
  }

  if (IN_SCOPE_TITLE.test(input.title)) {
    return {
      status: "ACCEPTED",
      reason: "Title matches AI-training work",
      confidence: "MEDIUM",
    };
  }

  if (OUT_OF_SCOPE_CORPORATE.test(input.title)) {
    return {
      status: "REJECTED",
      reason: "Unrelated corporate role",
      confidence: "HIGH",
    };
  }

  return {
    status: "QUARANTINED",
    reason: "Uncertain AI-training relevance",
    confidence: "LOW",
  };
}
