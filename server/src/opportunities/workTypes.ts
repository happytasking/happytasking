export type SourceWorkType = {
  key: string;
  label: string;
  chip: string;
  domainSlug: string;
};

export const SOURCE_WORK_TYPES: SourceWorkType[] = [
  { key: "coding", label: "Coding", chip: "Coding", domainSlug: "coding" },
  {
    key: "rlhf-eval",
    label: "RLHF / Evaluation",
    chip: "Evaluation",
    domainSlug: "generalist",
  },
  {
    key: "stem-math",
    label: "STEM & Math",
    chip: "STEM & Math",
    domainSlug: "science",
  },
  {
    key: "domain-expert",
    label: "Domain Experts",
    chip: "Domain Experts",
    domainSlug: "other",
  },
  {
    key: "multilingual",
    label: "Multilingual",
    chip: "Languages",
    domainSlug: "translation",
  },
  {
    key: "data-labeling",
    label: "Data Labeling",
    chip: "Data Labeling",
    domainSlug: "data-annotation",
  },
  {
    key: "audio-speech",
    label: "Audio & Speech",
    chip: "Audio & Speech",
    domainSlug: "other",
  },
  {
    key: "red-teaming",
    label: "Red-Teaming",
    chip: "Red Teaming",
    domainSlug: "research",
  },
  {
    key: "agentic-eval",
    label: "Agentic & RL Envs",
    chip: "Agentic",
    domainSlug: "coding",
  },
  { key: "writing", label: "Writing", chip: "Writing", domainSlug: "writing" },
  {
    key: "research-studies",
    label: "Studies & Surveys",
    chip: "Studies",
    domainSlug: "research",
  },
];

export const SOURCE_WORK_TYPE_BY_KEY = new Map(
  SOURCE_WORK_TYPES.map((row) => [row.key, row]),
);

export const WORK_TYPE_DOMAIN: Record<string, string> = Object.fromEntries(
  SOURCE_WORK_TYPES.map((row) => [row.key, row.domainSlug]),
);

export function workTypeLabel(key: string | null | undefined): string | null {
  if (!key) return null;
  return SOURCE_WORK_TYPE_BY_KEY.get(key)?.label ?? null;
}

export function isSourceWorkType(value: string | undefined | null): boolean {
  if (!value) return false;
  return SOURCE_WORK_TYPE_BY_KEY.has(value);
}
