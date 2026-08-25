"use client";

const STEPS = [
  { n: 1, label: "Profile" },
  { n: 2, label: "Expertise" },
  { n: 3, label: "Experience" },
  { n: 4, label: "Done" },
];

export function OnboardingProgress({ current }: { current: number }) {
  return (
    <div>
      <div className="progress-track" aria-hidden="true">
        {STEPS.map((step, i) => (
          <div key={step.n} className="flex min-w-0 flex-1 items-center gap-0.5">
            <span className="dot" data-active={current >= step.n}>
              {step.n}
            </span>
            {i < STEPS.length - 1 && (
              <span className="bar" data-active={current > step.n} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-subtle">
        {STEPS.map((step) => (
          <span
            key={step.n}
            className={current >= step.n ? "text-accent" : ""}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
