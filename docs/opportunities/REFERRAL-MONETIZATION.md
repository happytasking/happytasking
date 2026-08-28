# Referral monetization

Layers:

1. Source / discovery URL (audit)
2. Original official application URL
3. Optional Happy Tasking referral destination

AITraining.jobs referral parameters are **not** Happy Tasking monetization.
They are preserved on `rawDiscoveryApplicationUrl` and stripped from
`originalApplicationUrl` using explicit rules (`referralCode`,
`utm_source=referral`, `utm_medium=share`, `utm_campaign=job_referral`, and
named affiliate keys). Arbitrary query-string stripping is forbidden.

`ReferralProgram` must be `authorized=true` and `status=ACTIVE` before a
destination is used. Otherwise Apply uses the original official URL.

No Happy Tasking referral programs are configured in Sprint 4.6 by default.

Disclosure when a Happy Tasking referral is used:

> Happy Tasking may earn a commission if you join through this link. This does
> not affect your pay or our company scores.

Events: `opportunity_apply_clicked`, `referral_apply_clicked`. Conversion is
never claimed without verified data.

Commercial relationships do not influence Happy Tasking's independent
company intelligence.
