# LuckyDuck Product Strategy, Roadmap, and Commercial Review
**Date:** 2026-04-07  
**Prepared by:** Ptolemy, Product Strategy & Productization Division

## Executive Product Thesis
LuckyDuck turns the messy, low-trust "fishbowl giveaway" into a branded, operationally reliable lead capture workflow for live events.

The product is not just a giveaway form. It is a lightweight event lead capture system optimized for in-person environments where speed, branding, offline resilience, and winner selection matter. The strongest value is not that it collects entries, but that it helps a team:
- launch a branded giveaway fast,
- collect cleaner leads than paper bowls or ad hoc forms,
- continue capturing entries even with spotty Wi‑Fi,
- run a legitimate random winner draw, and
- leave the event with exportable data instead of a pile of business cards.

### Why use LuckyDuck instead of Google Forms or a physical fishbowl?
**Compared with a physical fishbowl:**
- no manual data entry after the event
- no illegible handwriting or incomplete info
- cleaner winner selection and auditability
- branded digital experience instead of a generic bowl on a table
- instant exportable lead list

**Compared with Google Forms or generic forms:**
- designed for live event use, not generic survey collection
- supports tenant branding and event-specific drawings
- includes built-in winner selection workflow
- supports offline-first entry capture behavior
- gives each customer a dedicated event/admin experience instead of a one-off form hack

**Bottom line:** LuckyDuck’s core value is operational simplicity for event-driven lead capture.

## Current Product Capability Snapshot
Based on the codebase, LuckyDuck already supports:
- multitenant account structure
- self-serve beta tenant creation
- tenant branding with logo and brand colors
- multiple drawings per tenant
- drawing scheduling, active/inactive states, and upcoming/closed logic
- QR-driven event entry flow
- configurable form fields across name, email, phone, and company
- offline/spotty-connection queueing behavior on entry
- duplicate prevention per drawing by email
- entrant limits by plan tier
- admin PIN-protected event dashboard
- live stats including views, entries, eligible entrants, and winners
- random winner selection and confirmation
- CSV export of entrants
- superadmin tenant/drawing management

This is a credible beta MVP, not a concept demo.

## Recommended ICP & Positioning
### Ideal Beta ICP
The best initial beta customer is:

**B2B exhibitors and field marketing teams that attend recurring events and care about lead follow-up.**

### Best-fit beta segments
1. **Tradeshow exhibitors**
   - HVAC, medtech, industrial, manufacturing, telecom, dental, home services, franchise groups
   - strong fit because they already use giveaways to drive booth interaction

2. **Retail/storefront activation teams**
   - clinics, medspas, retail chains, franchise locations, local promo teams
   - fit when they want seasonal or recurring on-site promotions

3. **Agencies running activations for clients**
   - especially useful because one agency may manage multiple client drawings and value a reusable system

### Beta ICP criteria
Prioritize prospects that:
- run at least 3 to 6 in-person events or promos per year
- currently use paper bowls, generic forms, or disconnected lead capture methods
- need branded experiences
- care about exporting leads quickly after the event
- have small teams that benefit from low operational friction

### Positioning recommendation
**Category:** event giveaway and lead capture platform  
**Primary positioning:** the fastest way to run branded prize drawings at live events and leave with clean leads  
**Secondary positioning:** a modern replacement for fishbowl raffles, paper signups, and hacked-together forms

### Positioning statement
LuckyDuck helps event teams run branded giveaway campaigns that capture real leads, work reliably on-site, and make winner selection simple, without clipboards, paper bowls, or generic form tools.

## Beta Offer Design
### Recommended beta package
**Offer name:** LuckyDuck Founding Beta

### Beta promise
Launch your first branded event drawing fast, prove lead capture value in the field, and help shape the product before public release.

### Suggested beta structure
- **Price:** Free for approved beta partners
- **Included:**
  - 1 active workspace
  - up to 1 live drawing/event
  - up to 250 entrants
  - branding customization
  - QR code generation
  - CSV export
  - winner selection workflow
  - onboarding support from founder/team
- **Beta term:** 60 to 90 days or through first live event cycle

### Exact value exchange for early adopters
Early adopters receive:
- free use during beta
- direct setup help
- priority support
- influence on roadmap
- grandfathered pricing or founding customer discount at conversion

In exchange, they provide:
- one real event use case
- product feedback after live usage
- permission for a short testimonial or case study if successful
- tolerance for some rough edges in a beta product

### Beta acquisition model
Use an **application-style beta**, not fully open self-serve at scale.

Reason:
- the product is strongest in a narrow use case today
- support burden will matter during early launch
- handpicked customers will produce better proof and roadmap signal

### Recommended beta message
"Join the founding beta for event teams replacing fishbowls, clipboards, and generic forms with a branded giveaway workflow that actually works on-site."

## Proposed Post-Beta Pricing Model
## Pricing model recommendation
Use a **hybrid subscription model with event capacity limits**, not per-lead pricing.

### Why not per-lead pricing?
- feels punitive when the product succeeds
- hard to forecast for customers
- weak fit for event marketers who budget by campaign or month

### Why not event-only pricing?
- limits recurring revenue
- weaker for customers with multiple activations per year
- reduces platform stickiness

### Best model
**Monthly/annual subscription with included event capacity and entrant limits, plus enterprise custom plans.**

## Recommended pricing architecture
### Starter
**$49/month** or **$490/year**
- 1 active brand/workspace
- up to 3 drawings per month
- up to 500 entrants per drawing
- QR code + CSV export
- winner selection
- basic branding
- email support

### Growth
**$149/month** or **$1,490/year**
- 1 brand/workspace
- up to 15 drawings per month
- up to 2,500 entrants per drawing
- advanced branding
- multiple team admins
- basic integrations/webhooks when available
- priority support

### Agency / Multi-Location
**$299/month** or **$2,990/year**
- multiple client brands or locations
- higher entrant limits
- reusable event templates
- consolidated reporting
- faster support

### Enterprise
**Custom pricing, likely starting at $750 to $1,500+/month**
- SSO/admin controls
- CRM sync
- webhook/API support
- SLA/support expectations
- security/compliance review
- multi-region or franchise governance needs

## Pricing notes
- Offer annual discount to pull forward cash and validate commitment.
- Keep beta converts on a **founding discount for 12 months**.
- Avoid freemium long term. The product is operational, support-touchy, and event-critical enough that free tiers will create noise.

## Feature Roadmap (Beta → v1 → v2)
## Beta, current/near-term
Current beta is strong enough for controlled launch if positioning is narrow.

### Beta must-haves before broader v1 release
1. **Event templates / duplication**
   - duplicate an existing drawing for the next event
   - critical for repeat usage
2. **Better admin/user management**
   - multiple admins per tenant or delegated access
3. **Entrant management actions**
   - search, filter, mark disqualified, manual resend/export handling
4. **Winner communication workflow**
   - at minimum, export-ready winner summary and templated outreach support
5. **Improved onboarding**
   - guided first-event setup, default templates, sample copy
6. **Post-event summary/report**
   - entries, conversion basics, winner log, export confirmation
7. **Legal/compliance fields**
   - consent checkbox, terms/privacy link support, optional age/state restrictions
8. **Offline sync confidence UX**
   - visible queued/submitted states so booth staff trust the system

## v1 critical missing features
These are the most important gaps between functional beta and commercial v1.

### 1. Reusability and repeatability
Without cloning/templates, the product feels like a one-off tool instead of a repeat workflow.

### 2. Integration basics
At minimum:
- webhook on new entrant
- Zapier/Make path
- CSV format presets
This is essential for post-event activation.

### 3. Automated communications
- winner notification email
- confirmation/follow-up email options
- optional "thanks for entering" email for compliance and follow-up bridge

### 4. Better analytics
- views vs entries conversion
- event-by-event performance
- time-based entry trends
- QR/source attribution if multiple codes are used

### 5. Team/admin permissions
Important for agencies, field teams, and clients.

### 6. Stronger anti-abuse / data quality controls
- duplicate logic beyond email-only
- rate limiting
- hidden spam checks
- device/session restrictions if needed for public activations

## v2 / Horizon 2 roadmap, what makes it sticky
### Highest-value H2 investments
1. **CRM and marketing syncs**
   - HubSpot, Salesforce, Klaviyo, Mailchimp, Google Sheets
   - this is the clearest stickiness lever

2. **Automated post-event workflows**
   - send leads to CRM
   - trigger owner notifications
   - route winners automatically

3. **Multi-location / multi-brand management**
   - franchise groups, agencies, enterprise field teams

4. **Reusable campaign library**
   - save event formats, prize templates, field sets, rules, and branded layouts

5. **Attribution and reporting enhancements**
   - source QR variants
   - booth rep/source tagging
   - campaign performance comparisons

6. **Rich consent and compliance controls**
   - consent history
   - region/state-specific compliance options
   - exportable consent record

7. **SMS/email capture and nurturing hooks**
   - not to become a CRM, but to hand off cleanly into one

8. **Tablet/kiosk mode optimizations**
   - guided staff mode
   - quick reset between entrants
   - larger touch UI options

### Strategic principle for roadmap
Do not try to become a full event platform. LuckyDuck wins by owning the giveaway-entry-to-export workflow better than generic tools.

## What to deprioritize for now
- broad consumer sweepstakes feature expansion
- complex custom form builder far beyond the current use case
- deep analytics suite before integrations and repeatability are solved
- freemium self-serve expansion before onboarding and support model are proven

## Homepage Guidance for Helios and Lyra
### What the homepage must highlight
1. **Audience specificity first**
   - say "tradeshows, live events, and storefront giveaways" immediately
2. **Problem replacement framing**
   - explicitly position against fishbowls, clipboards, paper forms, and generic form hacks
3. **Operational proof**
   - show real product screenshots: entrant form, admin dashboard, winner draw, QR workflow
4. **The real differentiators**
   - branded setup
   - offline-friendly capture
   - QR-ready event flow
   - winner selection
   - clean CSV export
5. **Beta urgency**
   - founding beta, limited onboarding slots, direct support, shape the roadmap
6. **Outcome messaging**
   - more booth engagement
   - cleaner lead capture
   - faster follow-up after events

### Recommended homepage claim hierarchy
**Hero headline direction:**  
Run branded giveaway campaigns at events, without the fishbowl chaos.

**Hero subhead direction:**  
LuckyDuck helps tradeshow teams, field marketers, and activation teams collect entries, pick winners, and export clean leads from one simple platform, even in spotty event Wi‑Fi conditions.

### Key proof blocks to include
- real UI screenshot
- how it works in 3 steps
- comparison against paper bowls / Google Forms
- beta offer block with founding customer benefits
- use cases: tradeshow booth, storefront promo, agency-managed activation

### CTA direction
Use:
- **Join Founding Beta**
- **Start Your First Event Drawing**
- **Apply for Beta Access**

Avoid generic CTA language like "Create Free Account" unless the product is intentionally fully self-serve.

## Final Strategic Recommendation
LuckyDuck should launch beta as a **narrowly positioned event giveaway and lead capture product**, not as a generic contest platform.

The wedge is strong: businesses already run giveaways, but most do it with manual, untrackable, low-conversion processes. LuckyDuck gives them a cleaner system with just enough operational infrastructure to feel real.

### Best go-to-market sequence
1. recruit 10 to 20 high-fit beta users in tradeshows, field marketing, retail promos, and agencies
2. validate repeat use across multiple live events
3. ship v1 around repeatability, winner communications, and integrations
4. convert to subscription pricing with founding discounts
5. expand into agencies, multi-location brands, and enterprise field teams

If LuckyDuck stays focused on being the easiest way to run branded event giveaways that produce usable leads, it has a credible path to product-market fit.