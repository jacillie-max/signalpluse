@AGENTS.md

## Email Delivery (Career Lab / bnedleadership.com)

All Career Lab (bnedleadership.com) emails are sent through **Resend**. Do not use beehiiv for Career Lab sends.
- Personalization (e.g. `first_name`, `career_score`) is done via template variables interpolated at send time, not platform merge tags.
- Audience segmentation (e.g. score bands) is handled in code by grouping recipients before sending, not via a UI segment builder.

## Deploy Protocol

Before any `vercel --prod`, run the workspace pre-deploy verification and fix all failures:
```bash
../scripts/pre-deploy-verify.sh .
```
Checks: tsc, production build, env diff against Vercel, API route smoke tests.
