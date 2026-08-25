import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import { recordActivationIfNeeded } from "./analytics.service.js";
import { maybeAwardFoundingTasker } from "./badge.service.js";

export const createComplaintSchema = z.object({
  companySlug: z.string(),
  category: z.enum([
    "PAYMENT",
    "REVIEWER_DISPUTE",
    "PROJECT_REMOVAL",
    "ACCOUNT_SUSPENSION",
    "SUPPORT",
    "RATE_CHANGE",
    "UNPAID_ONBOARDING",
    "GUIDELINES",
    "TASK_AVAILABILITY",
    "REIMBURSEMENT",
    "THROTTLE_TASK_LIMIT",
    "PLATFORM_ERROR",
    "OTHER",
  ]),
  title: z.string().min(5).max(200),
  body: z.string().min(20).max(10000),
  desiredOutcome: z.string().max(1000).optional(),
  publicIdentityMode: z.enum(["ANONYMOUS", "USERNAME"]).default("ANONYMOUS"),
});

export const createReplySchema = z.object({
  body: z.string().min(5).max(5000),
});

/** Outcomes the reporter can choose when confirming a resolution. */
const RESOLUTION_OUTCOMES = ["RESOLVED", "PARTIALLY_RESOLVED", "UNRESOLVED"] as const;

export const moderateStatusSchema = z.object({
  status: z.enum(["VERIFIED", "PUBLISHED", "RESOLUTION_PENDING"]),
  note: z.string().max(2000).optional(),
});

export const resolveComplaintSchema = z.object({
  outcome: z.enum(RESOLUTION_OUTCOMES),
  satisfaction: z.coerce.number().int().min(1).max(5),
  note: z.string().max(2000).optional(),
});

/** Statuses that put an issue on the public directory. */
const PUBLIC_STATUSES = [
  "VERIFIED",
  "PUBLISHED",
  "COMPANY_RESPONDED",
  "RESOLUTION_PENDING",
  "RESOLVED",
  "PARTIALLY_RESOLVED",
  "UNRESOLVED",
] as const;

/**
 * The moderated path from submission to publication. Each target status lists the
 * statuses it may be reached from, so the queue cannot skip a step.
 */
const MODERATOR_TRANSITIONS: Record<string, readonly string[]> = {
  VERIFIED: ["SUBMITTED"],
  PUBLISHED: ["VERIFIED"],
};

/** An issue can only await the reporter's verdict once it is public and answered. */
const RESOLUTION_PROPOSABLE = new Set<string>(["PUBLISHED", "COMPANY_RESPONDED"]);

/** Statuses already past "the company has spoken", which a reply must not roll back. */
const POST_RESPONSE_STATUSES = new Set<string>([
  "COMPANY_RESPONDED",
  "RESOLUTION_PENDING",
  "RESOLVED",
  "PARTIALLY_RESOLVED",
  "UNRESOLVED",
]);

export type Viewer = { id: string; role: string } | undefined;

function nextPublicId() {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `HT-${n}`;
}

const complaintInclude = {
  company: {
    select: { name: true, slug: true, logoUrl: true, claimStatus: true },
  },
  user: { select: { id: true, username: true, displayName: true } },
  replies: {
    // Oldest first, with id as a tiebreaker so replies posted in the same
    // millisecond keep a stable order.
    orderBy: [
      { createdAt: "asc" },
      { id: "asc" },
    ] as Prisma.ComplaintReplyOrderByWithRelationInput[],
    include: {
      author: { select: { id: true, username: true, displayName: true } },
    },
  },
} as const;

export async function createComplaint(
  input: z.infer<typeof createComplaintSchema>,
  userId?: string,
) {
  const company = await prisma.company.findUnique({
    where: { slug: input.companySlug },
  });
  if (!company) throw new ApiError(404, "Company not found");

  let publicId = nextPublicId();
  while (await prisma.complaint.findUnique({ where: { publicId } })) {
    publicId = nextPublicId();
  }

  const complaint = await prisma.complaint.create({
    data: {
      publicId,
      companyId: company.id,
      userId: userId || null,
      category: input.category,
      title: input.title,
      body: input.body,
      desiredOutcome: input.desiredOutcome,
      publicIdentityMode: input.publicIdentityMode,
      status: "SUBMITTED",
    },
    include: complaintInclude,
  });

  if (userId) {
    await recordActivationIfNeeded(userId);
    await maybeAwardFoundingTasker(userId);
  }

  // The submitter always gets their own report back, even though it is not public yet.
  return publicComplaint(complaint, {
    canView: true,
    canReply: !!userId,
    isReporter: true,
    isCompany: false,
    isModerator: false,
    membership: null,
  });
}

export async function listComplaints(
  params: {
    companySlug?: string;
    status?: string;
    page?: number;
    limit?: number;
  },
  viewer?: Viewer,
) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 20));

  let companyId: string | undefined;
  if (params.companySlug) {
    const company = await prisma.company.findUnique({
      where: { slug: params.companySlug },
    });
    if (!company) throw new ApiError(404, "Company not found");
    companyId = company.id;
  }

  // A company rep browsing their own company sees the triage queue too, so the
  // profile doubles as an inbox.
  const isOwnCompanyInbox =
    !!companyId &&
    !!viewer &&
    !!(await prisma.companyMember.findUnique({
      where: { userId_companyId: { userId: viewer.id, companyId } },
      select: { approved: true },
    }))?.approved;

  // Moderators run the triage queue, so they see every status regardless of company.
  const isModerator = viewer?.role === "MODERATOR" || viewer?.role === "ADMIN";
  const seesEverything = isModerator || isOwnCompanyInbox;

  // A status filter must never widen what the viewer is allowed to see. For the
  // public it can only narrow the already-public set, and asking for a status they
  // cannot see returns nothing rather than silently falling back to everything.
  const visibleStatuses = params.status
    ? (PUBLIC_STATUSES as readonly string[]).includes(params.status)
      ? [params.status]
      : []
    : [...PUBLIC_STATUSES];

  const statusFilter = (
    seesEverything
      ? params.status
        ? { in: [params.status] }
        : undefined
      : { in: visibleStatuses }
  ) as Prisma.ComplaintWhereInput["status"];

  const where: Prisma.ComplaintWhereInput = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(companyId ? { companyId } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.findMany({
      where,
      include: complaintInclude,
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items: items.map((c) => publicComplaint(c)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getComplaint(publicId: string, viewer?: Viewer) {
  const complaint = await prisma.complaint.findUnique({
    where: { publicId },
    include: complaintInclude,
  });
  if (!complaint) throw new ApiError(404, "Complaint not found");

  const perms = await permissionsFor(complaint, viewer);
  if (!perms.canView) throw new ApiError(404, "Complaint not found");

  return publicComplaint(complaint, perms);
}

export async function createComplaintReply(
  publicId: string,
  viewer: NonNullable<Viewer>,
  input: z.infer<typeof createReplySchema>,
) {
  const complaint = await prisma.complaint.findUnique({
    where: { publicId },
    include: complaintInclude,
  });
  if (!complaint) throw new ApiError(404, "Complaint not found");

  const perms = await permissionsFor(complaint, viewer);
  if (!perms.canView) throw new ApiError(404, "Complaint not found");
  if (!perms.canReply) {
    throw new ApiError(403, "You cannot reply to this issue");
  }

  const authorRole = perms.isCompany
    ? "COMPANY"
    : perms.isModerator
      ? "MODERATOR"
      : "CONTRIBUTOR";

  await prisma.complaintReply.create({
    data: {
      complaintId: complaint.id,
      authorId: viewer.id,
      authorRole,
      authorTitle: perms.membership?.title ?? null,
      body: input.body.trim(),
    },
  });

  // An official reply is itself newsworthy: publish the issue if it was still in
  // triage, and record that the company has responded.
  if (authorRole === "COMPANY" && !POST_RESPONSE_STATUSES.has(complaint.status)) {
    await prisma.complaint.update({
      where: { id: complaint.id },
      data: { status: "COMPANY_RESPONDED" },
    });
  }

  return getComplaint(publicId, viewer);
}

/**
 * Advances an issue along the moderated workflow. Verification and publication are
 * moderator-only; asking for the reporter's verdict is also open to the company,
 * since they are the ones who know when a fix has shipped.
 */
export async function moderateComplaintStatus(
  publicId: string,
  viewer: NonNullable<Viewer>,
  input: z.infer<typeof moderateStatusSchema>,
) {
  const complaint = await prisma.complaint.findUnique({
    where: { publicId },
    include: complaintInclude,
  });
  if (!complaint) throw new ApiError(404, "Complaint not found");

  const perms = await permissionsFor(complaint, viewer);
  if (!perms.canView) throw new ApiError(404, "Complaint not found");

  const target = input.status;

  if (target === "RESOLUTION_PENDING") {
    if (!perms.isCompany && !perms.isModerator) {
      throw new ApiError(403, "Only the company or a moderator can propose a resolution");
    }
    if (!RESOLUTION_PROPOSABLE.has(complaint.status)) {
      throw new ApiError(
        400,
        "An issue must be published before a resolution can be proposed",
      );
    }
  } else {
    if (!perms.isModerator) {
      throw new ApiError(403, "Only moderators can verify or publish issues");
    }
    const allowedFrom = MODERATOR_TRANSITIONS[target] ?? [];
    if (!allowedFrom.includes(complaint.status)) {
      throw new ApiError(
        400,
        `Cannot move an issue from ${complaint.status} to ${target}`,
      );
    }
  }

  await prisma.complaint.update({
    where: { id: complaint.id },
    data: {
      status: target,
      // Publication is the point at which the report has cleared review.
      ...(target === "PUBLISHED" ? { verificationStatus: "VERIFIED" } : {}),
    },
  });

  const note = input.note?.trim();
  if (note) {
    await prisma.complaintReply.create({
      data: {
        complaintId: complaint.id,
        authorId: viewer.id,
        authorRole: perms.isCompany && !perms.isModerator ? "COMPANY" : "MODERATOR",
        authorTitle: perms.membership?.title ?? null,
        body: note,
      },
    });
  }

  return getComplaint(publicId, viewer);
}

/**
 * Records the reporter's verdict once a resolution has been proposed. Reports filed
 * anonymously have no account to confirm them, so a moderator closes those out.
 */
export async function resolveComplaint(
  publicId: string,
  viewer: NonNullable<Viewer>,
  input: z.infer<typeof resolveComplaintSchema>,
) {
  const complaint = await prisma.complaint.findUnique({
    where: { publicId },
    include: complaintInclude,
  });
  if (!complaint) throw new ApiError(404, "Complaint not found");

  const perms = await permissionsFor(complaint, viewer);
  if (!perms.canView) throw new ApiError(404, "Complaint not found");

  const onBehalfOfAbsentReporter = perms.isModerator && !complaint.userId;
  if (!perms.isReporter && !onBehalfOfAbsentReporter) {
    throw new ApiError(403, "Only the reporter can confirm a resolution");
  }
  if (complaint.status !== "RESOLUTION_PENDING") {
    throw new ApiError(
      400,
      "The company has not proposed a resolution for this issue yet",
    );
  }

  await prisma.complaint.update({
    where: { id: complaint.id },
    data: {
      status: input.outcome,
      resolutionStatus: input.outcome,
      resolutionSatisfaction: input.satisfaction,
      resolvedAt: new Date(),
    },
  });

  const note = input.note?.trim();
  if (note) {
    await prisma.complaintReply.create({
      data: {
        complaintId: complaint.id,
        authorId: viewer.id,
        authorRole: perms.isReporter ? "CONTRIBUTOR" : "MODERATOR",
        body: note,
      },
    });
  }

  return getComplaint(publicId, viewer);
}

type Permissions = {
  canView: boolean;
  canReply: boolean;
  isReporter: boolean;
  isCompany: boolean;
  isModerator: boolean;
  membership: { title: string | null } | null;
};

async function permissionsFor(
  complaint: { userId: string | null; companyId: string; status: string; isDemo: boolean },
  viewer: Viewer,
): Promise<Permissions> {
  const isPublic =
    (PUBLIC_STATUSES as readonly string[]).includes(complaint.status) ||
    complaint.isDemo;

  if (!viewer) {
    return {
      canView: isPublic,
      canReply: false,
      isReporter: false,
      isCompany: false,
      isModerator: false,
      membership: null,
    };
  }

  const isModerator = viewer.role === "MODERATOR" || viewer.role === "ADMIN";
  const isReporter = !!complaint.userId && complaint.userId === viewer.id;
  const membership = await prisma.companyMember.findUnique({
    where: {
      userId_companyId: { userId: viewer.id, companyId: complaint.companyId },
    },
    select: { title: true, approved: true },
  });
  const isCompany = !!membership?.approved;

  return {
    canView: isPublic || isReporter || isCompany || isModerator,
    // Anyone with a stake in the thread can reply; passers-by cannot.
    canReply: isReporter || isCompany || isModerator,
    isReporter,
    isCompany,
    isModerator,
    membership: isCompany ? { title: membership?.title ?? null } : null,
  };
}

type ComplaintRecord = {
  publicId: string;
  category: string;
  title: string;
  body: string;
  desiredOutcome: string | null;
  verificationStatus: string;
  publicIdentityMode: string;
  status: string;
  resolutionStatus: string | null;
  resolutionSatisfaction: number | null;
  submittedAt: Date;
  resolvedAt: Date | null;
  isDemo: boolean;
  userId: string | null;
  company: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    claimStatus?: string;
  };
  user?: { id: string; username: string; displayName: string | null } | null;
  replies?: {
    id: string;
    authorRole: string;
    authorTitle: string | null;
    body: string;
    createdAt: Date;
    authorId: string | null;
    author?: { id: string; username: string; displayName: string | null } | null;
  }[];
};

function nextModeratorStatus(status: string): "VERIFIED" | "PUBLISHED" | null {
  if (status === "SUBMITTED") return "VERIFIED";
  if (status === "VERIFIED") return "PUBLISHED";
  return null;
}

function publicComplaint(c: ComplaintRecord, perms?: Permissions) {
  const anonymous = c.publicIdentityMode === "ANONYMOUS";
  const reporterName =
    c.user?.displayName?.trim() || c.user?.username?.trim() || "Community member";
  const authorLabel = anonymous ? "Identity protected" : reporterName;

  const replies = (c.replies ?? []).map((r) => {
    const isReporter = !!r.authorId && r.authorId === c.userId;
    // The reporter's own follow-ups inherit the anonymity of the report itself.
    const label =
      r.authorRole === "COMPANY"
        ? c.company.name
        : r.authorRole === "MODERATOR"
          ? "Happy Tasking moderator"
          : isReporter && anonymous
            ? "Reporter (identity protected)"
            : r.author?.displayName?.trim() ||
              r.author?.username?.trim() ||
              "Community member";

    return {
      id: r.id,
      role: r.authorRole,
      authorLabel: label,
      authorTitle: r.authorTitle,
      authorLogoUrl: r.authorRole === "COMPANY" ? c.company.logoUrl ?? null : null,
      isOfficial: r.authorRole === "COMPANY",
      isReporter,
      identityProtected: r.authorRole === "CONTRIBUTOR" && isReporter && anonymous,
      body: r.body,
      createdAt: r.createdAt,
    };
  });

  return {
    publicId: c.publicId,
    category: c.category,
    title: c.title,
    body: c.body,
    desiredOutcome: c.desiredOutcome,
    verificationStatus: c.verificationStatus,
    identity: authorLabel,
    identityProtected: anonymous,
    author: anonymous
      ? null
      : c.user
        ? { username: c.user.username, displayName: c.user.displayName }
        : null,
    status: c.status,
    resolutionStatus: c.resolutionStatus,
    resolutionSatisfaction: c.resolutionSatisfaction,
    submittedAt: c.submittedAt,
    resolvedAt: c.resolvedAt,
    isDemo: c.isDemo,
    company: c.company,
    replies,
    replyCount: replies.length,
    companyReplied: replies.some((r) => r.isOfficial),
    isPublic:
      (PUBLIC_STATUSES as readonly string[]).includes(c.status) || c.isDemo,
    viewer: perms
      ? {
          canReply: perms.canReply,
          isReporter: perms.isReporter,
          isCompany: perms.isCompany,
          isModerator: perms.isModerator,
          // The next step this viewer is allowed to take, so the UI never offers a
          // control the API would reject.
          moderatorNextStatus: perms.isModerator
            ? nextModeratorStatus(c.status)
            : null,
          canProposeResolution:
            (perms.isCompany || perms.isModerator) &&
            RESOLUTION_PROPOSABLE.has(c.status),
          canConfirmResolution:
            c.status === "RESOLUTION_PENDING" &&
            (perms.isReporter || (perms.isModerator && !c.userId)),
          // A moderator closing out a report whose author left no account.
          confirmingForAbsentReporter:
            c.status === "RESOLUTION_PENDING" &&
            !perms.isReporter &&
            perms.isModerator &&
            !c.userId,
        }
      : null,
  };
}
