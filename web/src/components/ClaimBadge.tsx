type Props = {
  status?: string | null;
  /** Hide the badge entirely for unclaimed profiles (useful in dense tables). */
  hideUnclaimed?: boolean;
  className?: string;
};

/**
 * Shows whether a company has claimed and verified its profile. A claim is only
 * marked verified after a moderator approves it, so the badge means something.
 */
export function ClaimBadge({
  status,
  hideUnclaimed = false,
  className = "",
}: Props) {
  if (!status) return null;

  if (status === "CLAIMED") {
    return (
      <span
        className={`badge gap-1 bg-good-bg text-good ${className}`}
        title="This company has claimed its profile and can respond to issues."
      >
        <CheckSeal />
        Verified profile
      </span>
    );
  }

  if (status === "PENDING") {
    return (
      <span
        className={`badge bg-mid-bg text-mid ${className}`}
        title="A representative has requested this profile; verification is in review."
      >
        Claim pending
      </span>
    );
  }

  if (hideUnclaimed) return null;

  return (
    <span
      className={`badge bg-demo-bg text-demo ${className}`}
      title="No verified representative has claimed this profile, so the company cannot respond to issues here."
    >
      Profile not claimed
    </span>
  );
}

function CheckSeal() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="11"
      height="11"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M8 0.7l1.9 1.4 2.3-.2.7 2.2 1.9 1.4-1 2.1 1 2.1-1.9 1.4-.7 2.2-2.3-.2L8 15.3l-1.9-1.4-2.3.2-.7-2.2L1.2 10.5l1-2.1-1-2.1 1.9-1.4.7-2.2 2.3.2L8 .7zm-.8 9.9l3.9-3.9-1.1-1.1-2.8 2.8-1.4-1.4-1.1 1.1 2.5 2.5z" />
    </svg>
  );
}
