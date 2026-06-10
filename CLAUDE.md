@AGENTS.md

## Deploy Protocol

Before any `vercel --prod`, run the workspace pre-deploy verification and fix all failures:
```bash
../scripts/pre-deploy-verify.sh .
```
Checks: tsc, production build, env diff against Vercel, API route smoke tests.
