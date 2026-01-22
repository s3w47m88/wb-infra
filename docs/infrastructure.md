# AI Website Platform — Master README (Persistent Memory)

## SYSTEM PROMPT (READ FIRST)
You are an AI engineering agent (Claude Code / ChatGPT Codex).

Your responsibilities:
- Treat this document as authoritative, persistent memory
- Execute tasks incrementally
- Never violate architecture, security boundaries, or separation of planes
- Mark tasks [x] only when fully implemented and verified
- Ask before deviating from this design
- Optimize for security, scale, performance, and auditability

---

## 1. PROJECT GOAL
A multi-tenant platform allowing customers to:
- Create Organizations (accounts)
- Manage a network/cluster of sites under one organization
- Build websites using templates + AI-generated themes
- Edit content and styling in real time
- Publish sites as static HTML/CSS/JS (SSG/ISR)
- Sell products with unique SEO-safe content per site
- Compare content similarity across owned sites
- Regenerate content with AI to reduce similarity
- Use custom domains with automatic SSL
- Be billed securely via integrated payments

---

## 2. CORE ARCHITECTURE (NON-NEGOTIABLE)

### Planes
Control Plane (Supabase A)
- Organizations
- Users
- Memberships / Roles
- Billing / Entitlements
- Site registry
- Feature flags
- Audit logs

Content Plane (Supabase B)
- Pages, products, content blocks
- Content revisions
- Embeddings (pgvector)
- Similarity scores
- Media metadata

Planes MUST be isolated.

---

## 3. SERVERS / SERVICES

### UI & APIs
- System Admin UI Server
  - Internal staff only
  - Org/user provisioning
  - Billing controls (no raw card access)
- User UI Server
  - Customer-facing dashboard
  - Org + site management
  - Theme + content editor
  - Triggers builds and AI jobs
- Control API
  - Identity, entitlements, billing state
  - Service-role only
  - Never exposed directly to browsers
- Content API
  - Read/write content
  - Trigger embeddings + similarity jobs
  - Scoped tokens only

### Build & Delivery
- Build Queue / Job System
- Builder Server
  - Next.js SSG + ISR
  - Reads Content Plane
  - Outputs static assets
- Object Storage
  - Stores build artifacts
- CDN
  - Serves all public sites
  - Subdomains + custom domains

### Integrations
- Billing Service
  - Tokenized payments only
  - Idempotent charges
  - Manual billing protected by step-up auth

---

## 4. RENDERING STRATEGY
- No runtime DB calls from public sites
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- Pages rebuild on:
  - Publish
  - On-demand regeneration
- CDN-first delivery

---

## 5. CONTENT SIMILARITY FEATURE (KEY DIFFERENTIATOR)

### Purpose
Allow customers to:
- Own many sites
- Sell identical products
- Maintain SEO-unique content

### Mechanism
- Stable content_key per product field (e.g. SKU + description)
- Embeddings stored per revision
- Similarity computed across sites within same org
- UI shows:
  - Other sites
  - Similarity %
  - Progress bar

### AI Rewrite
- On-demand only
- Target similarity threshold
- Saves new revision
- Re-embeds + recomputes similarity

---

## 6. SECURITY PRINCIPLES
- Strict RLS everywhere
- No cross-plane access
- Runtime servers are read-only
- No card data stored (processor tokens only)
- All billing actions:
  - Idempotent
  - Audited
  - Role + step-up protected
- Secrets stored in secure manager
- Immutable audit logs

---

## 7. STORAGE
- Supabase Storage for:
  - Images
  - Media
- Object Storage for:
  - Static site builds
- CDN in front of all public assets

---

## 8. BILLING RULES
- Payment processor only
- No arbitrary charges
- Subscriptions + invoices only
- Idempotency keys REQUIRED
- Daily/org caps
- Alerts on anomalies

---

## 9. SCALING ASSUMPTIONS
- Orgs: growing monthly
- Sites/org: 50–500+
- Products/site: hundreds to tens of thousands
- Traffic: steady initially
- AI: on-demand only

---

## 10. TASK TRACKING

### Infrastructure
- [ ] Create Supabase Control Plane project
- [ ] Create Supabase Content Plane project
- [ ] Define schemas and RLS (Control)
- [ ] Define schemas and RLS (Content)
- [ ] Enable pgvector
- [ ] Provision object storage
- [ ] Configure CDN + SSL
- [ ] Set up Railway services

### APIs
- [ ] Control API scaffold
- [ ] Content API scaffold
- [ ] Billing Service scaffold
- [ ] QuickBooks integration

### UI
- [ ] System Admin UI
- [ ] User Admin UI
- [ ] Theme editor
- [ ] Content editor
- [ ] Similarity dashboard

### Build System
- [ ] Job queue
- [ ] Builder service
- [ ] SSG pipeline
- [ ] ISR hooks
- [ ] Cache invalidation

### AI
- [ ] Rewrite orchestration
- [ ] Embedding generation
- [ ] Similarity computation
- [ ] Rewrite validation

### Security & Ops
- [ ] Audit logging
- [ ] Rate limiting
- [ ] Alerts
- [ ] Backup strategy
- [ ] Disaster recovery plan

---

## 11. AI OPERATING RULES
- Never collapse planes
- Never expose service keys
- Never introduce runtime DB calls to public sites
- Always prefer static + cache
- Ask before changing architecture

END OF MEMORY

---

## Platform Diagram
Platform
|-- Control Plane (Supabase A)
|   |-- Orgs & Users DB
|   |-- Auth Service
|   |-- Billing Service
|   |-- Audit Logs
|   |-- System Admin UI Server (secure)
|   `-- Control API (service-role; internal only)
|
|-- Content Plane (Supabase B)
|   |-- Content DB (pages, products, revisions, embeddings)
|   |-- Media Storage (CDN-backed)
|   |-- AI Services (rewrite/similarity on-demand)
|   `-- Content API (read/write; scoped)
|
|-- Customer App (User UI Server)
|   |-- User Admin UI (org, users, sites)
|   |-- Site Editor (theme + content)
|   `-- Calls:
|       |-- Control API (identity/entitlements)
|       `-- Content API (content/theme + trigger build)
|
|-- Build Pipeline
|   |-- Build Queue / Jobs
|   `-- Builder Server (Next.js SSG + ISR)
|       |-- Reads Content API (and entitlements if needed)
|       |-- Produces static build output
|       `-- Publishes to Object Storage
|
|-- Delivery
|   |-- Object Storage (static site artifacts)
|   |-- CDN (cache/edge)
|   |-- Domains
|   |   |-- Subdomains (*.yourplatform.com)
|   |   `-- Custom Domains (customer.com + SSL)
|   `-- Generated Frontend Sites (public)
|
`-- Integrations
    `-- QuickBooks Sync Service
        |-- OAuth/token store
        |-- Webhook handler + retries
        `-- Writes sync state to Control Plane (and/or Billing DB)
