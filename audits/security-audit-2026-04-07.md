# LuckyDuck Security Audit
**Date:** 2026-04-07  
**Auditor:** Zeus (DevSecOps)  
**Project:** LuckyDuck  
**Path:** `/Users/motokocatalyst/.openclaw/workspace/mos/projects/luckyduck`

## Executive Summary
LuckyDuck currently has a **Critical** security posture. The largest risk is that the app relies on broadly open Supabase Row Level Security policies and performs privileged-looking tenant, drawing, entrant, and admin operations directly from client-side code using the public anon key. In practice, this means tenant data isolation is not meaningfully enforced at the database layer, and administrative actions are protected mostly by client logic or weak shared-secret patterns rather than trusted server authorization.

The most serious issues are:
1. **Open RLS policies for multitenant data** on `tenants` and `drawings`, including public `INSERT` and `UPDATE`.
2. **Client-side authorization for tenant admin pages**, including PIN verification in the browser against database data.
3. **Weak superadmin session design**, using a deterministic cookie derived from the password with no per-session randomness, no rotation, and no rate limiting.
4. **Information leakage** via `/api/status`, which exposes environment/configuration state and validates whether a hardcoded admin PIN matches.
5. **Overly permissive Next.js image remote patterns**, allowing remote images from any HTTPS host.

There were no obvious hardcoded live secrets in source files from this snapshot, and there is no evidence of a service-role key being used client-side. However, the present architecture still allows severe unauthorized access and cross-tenant tampering because authorization is not enforced on the server/database in a robust way.

## Risk Posture
**Critical**

## Scope Covered
- Dependency audit via `npm audit`
- Secrets and credential exposure review
- Supabase schema and RLS review
- API route and auth review
- Next.js config review
- CI/CD workflow review
- SaaS-specific multitenancy/admin/QR risk review

## Findings Table

| ID | Severity | Area | Finding | Impact |
|---|---|---|---|---|
| F-01 | Critical | Supabase / Multitenancy | `tenants` has public `SELECT`, `INSERT`, and `UPDATE` RLS policies | Any client with anon access can potentially enumerate, create, or modify tenant records |
| F-02 | Critical | Supabase / Multitenancy | `drawings` has public `SELECT`, `INSERT`, and `UPDATE` RLS policies | Any client can potentially create/update drawings across tenants |
| F-03 | Critical | Admin Security | Tenant admin PIN is stored in database plaintext and checked client-side | Anyone who can read drawing records can recover the PIN and access tenant admin functions |
| F-04 | Critical | Authorization | Admin dashboard actions are executed directly from client-side Supabase calls | Unauthorized users may export entrants, mark winners, view PII, and manipulate drawing state |
| F-05 | High | Superadmin Auth | Superadmin cookie is a deterministic HMAC of a static string with `SUPERADMIN_PASSWORD` as secret | Session forgery/replay risk, no session rotation, no revocation model beyond changing password |
| F-06 | High | API Security | No rate limiting on `/api/superadmin/auth`, `/api/superadmin/verify`, or `/api/track` | Enables brute force, abuse, and traffic inflation |
| F-07 | High | Info Exposure | `/api/status` reveals environment/configuration details and admin PIN correctness | Attackers gain recon and can confirm sensitive configuration state |
| F-08 | Medium | Next.js Config | `images.remotePatterns` allows `https://**` | Broad external image loading increases tracking, abuse, and untrusted content exposure |
| F-09 | Medium | Data Integrity | `/api/track` falls back to read-then-update when RPC fails | Non-atomic updates permit race conditions and manipulated view counts |
| F-10 | Medium | SaaS Logic | Beta signup creates tenants directly from the client | Abuse/spam tenant creation and tenant namespace squatting |
| F-11 | Medium | CI/CD | No `.github/workflows/` security gates found | No automated lint, dependency scanning, SAST, or secret scanning in CI |
| F-12 | Medium | Dependencies | `npm audit` reports 2 high vulnerabilities (`flatted`, `picomatch`) in transitive dependencies | Known vulnerable packages remain in lockfile |

## Detailed Findings

### F-01, F-02: Open RLS policies break tenant isolation
**Evidence:** `supabase_schema.sql`
- `CREATE POLICY "Allow public select tenants" ... USING (true)`
- `CREATE POLICY "Allow public insert tenants" ... WITH CHECK (true)`
- `CREATE POLICY "Allow public update tenants" ... USING (true)`
- Equivalent public policies exist for `drawings`

**Why this matters:**
This is the core SaaS risk. Multitenant applications must enforce tenant ownership boundaries at the database layer. Current policies effectively treat tenant and drawing records as public mutable data.

**Impact:**
- Cross-tenant record enumeration
- Cross-tenant drawing creation/modification
- PIN disclosure through readable drawing records
- Brand spoofing, defacement, and data corruption

### F-03, F-04: Tenant admin is protected only by client-side PIN logic
**Evidence:** `src/app/[tenantSlug]/[drawingSlug]/admin/page.tsx`
- `if (pin === drawing.admin_pin) { setIsAuthorized(true); }`
- Entrants and drawing data are fetched directly from Supabase in the browser
- Winner confirmation and CSV export are performed from client-side code

**Why this matters:**
The browser receives `drawing.admin_pin` as part of the drawing object. That means the secret used for admin access is delivered to the client before authentication. If a user can fetch the drawing record, the PIN is effectively exposed.

**Impact:**
- Unauthorized access to admin dashboard
- Exposure of entrant PII
- Unauthorized winner selection/modification
- Export of all leads without real server authorization

### F-05: Superadmin session model is weak and deterministic
**Evidence:**
- `src/app/api/superadmin/auth/route.ts`
- `src/app/api/superadmin/verify/route.ts`

The session token is generated as:
- `HMAC(secret=SUPERADMIN_PASSWORD, message='luckyduck-superadmin-session')`

**Issues:**
- Same token for every successful login
- No per-session randomness
- No session store, revocation list, rotation, or device binding
- Password also acts as HMAC secret
- Plain equality password check, with no throttling or lockout

**Impact:**
- Replay/persistent cookie reuse
- Brute-force risk
- Weak operational control over admin sessions

### F-06: No rate limiting on sensitive endpoints
**Evidence:**
- No middleware present
- No route-level rate limiting found in `src/app/api/*`

**Affected endpoints:**
- `/api/superadmin/auth`
- `/api/superadmin/verify`
- `/api/track`

**Impact:**
- Password guessing on superadmin login
- Inflated analytics/view counts
- General endpoint abuse

### F-07: `/api/status` leaks sensitive operational details
**Evidence:** `src/app/api/status/route.ts`
Returns:
- `supabaseUrl`
- `hasAnonKey`
- `adminPin: pin === '6779' ? 'CORRECT' : 'WRONG/MISSING'`
- `nodeEnv`
- `cwd`

**Why this matters:**
This is a public recon endpoint. Even if it does not reveal the raw secret, it confirms configuration state and filesystem/runtime details that help an attacker map the environment.

**Impact:**
- Environment reconnaissance
- Confirmation of expected admin PIN configuration
- Easier targeting of deployment assumptions

### F-08: Overly broad image allowlist
**Evidence:** `next.config.ts`
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**' },
  ],
}
```

**Why this matters:**
Any HTTPS host is trusted for image rendering. This is too permissive for a SaaS app, especially one allowing tenant-controlled branding/logo URLs.

**Impact:**
- Untrusted external image embedding
- Privacy/tracking concerns
- Greater attack surface for malicious or abusive remote assets

### F-09: Non-atomic tracking fallback
**Evidence:** `src/app/api/track/route.ts`
If RPC fails, the route reads `view_count`, then writes `view_count + 1`.

**Why this matters:**
This introduces race conditions and allows easy metric manipulation. It is not a direct data exfil risk, but it weakens integrity.

### F-10: Unauthenticated client-side tenant creation
**Evidence:** `src/app/page.tsx`
The beta signup form inserts directly into `tenants` from the browser using the public Supabase client.

**Impact:**
- Spam tenant creation
- Namespace squatting by slug
- Polluted tenant inventory
- Potential abuse of storage and support workflows

### F-11: Missing CI/CD security controls
**Evidence:** no `.github/workflows/` files found

**Impact:**
- No automated dependency audit/SCA
- No lint/build gate enforcement in CI
- No secret scanning
- No code scanning or PR-level protection visible in repo

### F-12: Dependency vulnerabilities
**Evidence:** `npm audit`
- `flatted <=3.4.1` — high
- `picomatch 4.0.0 - 4.0.3` — high

**Notes:**
These appear transitive. They still warrant lockfile refresh and dependency updates.

## Secrets & Credentials Review
### What I checked
- `.env*` listing
- Source scan for hardcoded secrets/tokens
- Recent git history
- `next.config.ts` / environment usage

### Findings
- No `.env*` files were present in the repo snapshot from `ls -la .env*`.
- No obvious hardcoded live API keys or private keys were found in source files.
- Recent git history is short and does not itself show leaked secrets from commit subjects.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used as expected for client usage.
- I found **no direct evidence of a Supabase service-role key used in client-side code**.

### Important caveat
Even without a leaked service-role key, the app is still critically exposed because the anon-role plus permissive RLS effectively grants broad write capability.

## Supabase Security Review
### RLS
- `tenants`: enabled, but policies are effectively public and permissive
- `drawings`: enabled, but policies are effectively public and permissive
- `entrants`: schema comment indicates existing policies were kept open for public access, but entrant table definitions/policies are not fully shown in this file

### Service key usage
- No client-side `service_role` usage found

### Auth patterns
- No real user auth model is present for tenant admins
- Admin relies on a shared PIN in drawing data
- Superadmin uses a shared password cookie model, not a proper identity/session framework

## Auth & API Route Security Review
### API routes reviewed
- `src/app/api/status/route.ts`
- `src/app/api/superadmin/auth/route.ts`
- `src/app/api/superadmin/verify/route.ts`
- `src/app/api/track/route.ts`

### Observations
- No middleware protection found
- No CSRF-specific controls observed for auth endpoints
- No rate limiting observed
- No origin/referrer enforcement observed
- No audit logging observed

## SaaS-Specific Risk Review
### Multi-tenancy isolation
**Critical concern.** The current database policies do not establish trustworthy tenant boundaries.

### Admin route exposure
- `/{tenantSlug}/{drawingSlug}/admin` is discoverable and protected only by a client-side PIN comparison
- `/superadmin` is public and protected only by password-based session cookie auth with no throttling

### QR code / SSRF risk
The QR feature uses the current browser origin plus route params and local generation via the `qrcode` library. I did **not** find a direct SSRF vector in the QR generation itself.

However, tenant-controlled `logo_url` values are loaded by the browser/Next image pipeline from any HTTPS host due to permissive image config. That is not classic SSRF from a backend fetch I could confirm here, but it is still an untrusted remote-fetch surface.

## Remediation Recommendations

### Immediate, highest priority
1. **Redesign RLS for true tenant isolation**
   - Remove public `UPDATE` on `tenants` and `drawings`
   - Remove public `INSERT` except for a tightly constrained signup flow, ideally server-mediated
   - Introduce authenticated users and map them to tenant ownership/admin membership
   - Enforce `tenant_id`-scoped access in database policies

2. **Move admin actions to trusted server routes or server actions**
   - Do not expose `admin_pin` to the client
   - Store a hashed admin credential, never plaintext
   - Validate admin auth server-side and issue real sessions
   - Gate all entrant export, winner updates, and drawing edits behind server authorization

3. **Remove or lock down `/api/status`**
   - Delete in production, or restrict to authenticated internal/admin access only

4. **Add rate limiting**
   - Apply per-IP and preferably per-tenant limits to login and tracking endpoints
   - Consider Upstash Redis, Vercel Edge Config, or Supabase-backed throttling

### Near-term
5. **Replace superadmin auth with proper session management**
   - Use signed, random session IDs
   - Store sessions server-side or use a vetted auth library
   - Add brute-force protection and logging

6. **Restrict allowed image hosts**
   - Replace wildcard remote patterns with explicit allowlists
   - Validate tenant logo URLs before saving

7. **Harden beta signup**
   - Move tenant creation to a server endpoint
   - Add CAPTCHA, email verification, anti-automation, and allowlist/invite logic if appropriate

8. **Add CI security gates**
   - Build + lint on PRs
   - `npm audit` or Dependabot/SCA
   - secret scanning
   - CodeQL or equivalent SAST

9. **Patch dependencies**
   - Run `npm audit fix`
   - Re-test lockfile changes and builds

## Paste-Ready Security Headers Config
Add this to `next.config.ts` and tailor CSP domains to actual production dependencies.

```ts
import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "form-action 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "connect-src 'self' https://YOUR_PROJECT.supabase.co wss://YOUR_PROJECT.supabase.co",
      "font-src 'self' data:",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Replace with explicit trusted domains only
      { protocol: 'https', hostname: 'images.example.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

## Suggested Fix Order
1. Lock down Supabase RLS and remove public mutation paths
2. Rebuild tenant admin auth so secrets are not client-visible
3. Remove `/api/status` from production
4. Add rate limiting and brute-force protections
5. Replace superadmin cookie design
6. Restrict image hosts and tenant-controlled URLs
7. Add CI security checks and patch dependencies

## Command Outputs Summary
### `npm audit`
- 2 high severity vulnerabilities
- `flatted`
- `picomatch`

### `.env` files
- None found in repo snapshot

### Recent git history
- `17a39ae Rebrand to LuckyDuck with multitenant platform, beta self-signup, and admin dashboard`
- `76ee741 MVP release`
- `2fc6c57 tweak meta`
- `7194ee9 Initial commit for TelcoMotion Drawing App`

## Final Assessment
LuckyDuck is functional but not production-safe as a multitenant SaaS in its current form. The central problem is not a single leaked secret, it is that trust boundaries are misplaced: the browser and anon Supabase role are doing work that must be enforced by server-side authorization and strict RLS. Until that is corrected, unauthorized cross-tenant access and administrative abuse remain realistic risks.
