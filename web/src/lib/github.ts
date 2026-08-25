/** Public GitHub locations for the community repository. */
export const GITHUB_REPO = "https://github.com/happytasking/happytasking";

export const GITHUB = {
  repo: GITHUB_REPO,
  contributing: `${GITHUB_REPO}/blob/main/CONTRIBUTING.md`,
  roadmap: `${GITHUB_REPO}/blob/main/ROADMAP.md`,
  conduct: `${GITHUB_REPO}/blob/main/CODE_OF_CONDUCT.md`,
  security: `${GITHUB_REPO}/blob/main/SECURITY.md`,
  license: `${GITHUB_REPO}/blob/main/LICENSE`,
  manifesto: `${GITHUB_REPO}/blob/main/MANIFESTO.md`,
  governance: `${GITHUB_REPO}/blob/main/GOVERNANCE.md`,
  issues: `${GITHUB_REPO}/issues`,
  newIssue: `${GITHUB_REPO}/issues/new/choose`,
  bug: `${GITHUB_REPO}/issues/new?template=bug.yml`,
  feature: `${GITHUB_REPO}/issues/new?template=feature.yml`,
  dataCorrection: `${GITHUB_REPO}/issues/new?template=data-correction.yml`,
} as const;
