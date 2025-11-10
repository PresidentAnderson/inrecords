# 🧭 inRECORD Enterprise DevOps Plan (v1.0)

> Scaling from high-functioning prototype to enterprise-grade platform

---

## Executive Summary

This plan outlines the infrastructure, automation, and operational systems required to scale **inRECORD** from a working Next.js application into a **production-ready, enterprise-grade platform** supporting:

- 10,000+ concurrent users
- Real-time DAO voting and treasury management
- AI-powered digest generation and distribution
- Studio booking with payment processing
- Multilingual audio generation
- 99.9% uptime SLA

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
│  Next.js 14 (Vercel) • SSR/ISR • Edge Functions • CDN          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  Cloudflare Workers • Rate Limiting • DDoS Protection           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Studio    │  │     DAO     │  │   AI Lab    │            │
│  │  Booking    │  │ Governance  │  │  Services   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Supabase   │  │    Redis    │  │  Pinecone   │            │
│  │ (Postgres)  │  │   (Cache)   │  │  (Vectors)  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                   BLOCKCHAIN LAYER                               │
│  Ethereum (Mainnet) • Polygon (L2) • IPFS (Storage)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Stack

### Hosting & Deployment

| Service | Provider | Purpose | Cost/Month |
|---------|----------|---------|------------|
| **Frontend** | Vercel Pro | Next.js hosting, Edge functions, CDN | $20 |
| **Database** | Supabase Pro | Postgres, Auth, Real-time, Storage | $25 |
| **Cache** | Upstash Redis | Session cache, rate limiting | $10 |
| **Vector DB** | Pinecone Starter | Audio embeddings, AI search | $70 |
| **CDN** | Cloudflare Pro | DDoS protection, WAF, Analytics | $20 |
| **Monitoring** | Datadog | APM, logs, metrics, alerts | $31 |
| **Error Tracking** | Sentry | Error reporting, performance monitoring | $26 |
| **Uptime** | BetterStack | Status page, incident management | $18 |

**Total Monthly Infrastructure:** ~$220/month

### Development Tools

| Tool | Purpose |
|------|---------|
| **GitHub Actions** | CI/CD pipelines, automated testing |
| **Turborepo** | Monorepo build system |
| **Prettier + ESLint** | Code formatting and linting |
| **Husky + lint-staged** | Pre-commit hooks |
| **Jest + Playwright** | Unit and E2E testing |
| **Storybook** | Component library documentation |

---

## Environment Strategy

```
main (production)
 ├── Vercel Production
 ├── Supabase Production DB
 └── Ethereum Mainnet

develop (staging)
 ├── Vercel Preview
 ├── Supabase Staging DB
 └── Polygon Mumbai Testnet

feature/* (development)
 ├── Local Development
 ├── Supabase Local
 └── Hardhat Local Node
```

### Environment Variables Structure

```env
# Core
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_ENVIRONMENT=production|staging|development

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SUPABASE_JWT_SECRET=

# OpenAI
OPENAI_API_KEY=
OPENAI_ORG_ID=

# Web3
NEXT_PUBLIC_ALCHEMY_API_KEY=
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
DAO_CONTRACT_ADDRESS=
TREASURY_WALLET_ADDRESS=

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Audio
PLAYHT_API_KEY=
PLAYHT_USER_ID=

# Discord
DISCORD_WEBHOOK_URL=
DISCORD_BOT_TOKEN=

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
DATADOG_API_KEY=
SENTRY_DSN=

# Payments (Phase 7)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Redis
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Build application
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-staging:
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          alias-domains: staging.inrecord.xyz

  deploy-production:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'

      - name: Run smoke tests
        run: npm run test:smoke:production

      - name: Notify Discord
        uses: sarisia/actions-status-discord@v1
        if: always()
```

---

## Database Management

### Supabase Schema Versioning

```
migrations/
├── 20250110_initial_schema.sql
├── 20250115_studio_sessions.sql
├── 20250120_dao_proposals.sql
├── 20250125_dao_votes.sql
├── 20250130_treasury.sql
├── 20250205_ai_digests.sql
└── 20250210_user_profiles.sql
```

### Migration Strategy

1. **Development**: Write migration in local Supabase
2. **Testing**: Apply to staging database
3. **Review**: Team review + rollback test
4. **Production**: Apply during maintenance window
5. **Verification**: Run post-migration checks

### Backup Policy

- **Automated Backups**: Daily at 3 AM UTC
- **Point-in-Time Recovery**: 7 days retention
- **Long-term Storage**: Weekly snapshots to S3 (30 days)
- **Disaster Recovery**: Cross-region replication (RTO: 1 hour, RPO: 15 minutes)

---

## Security & Compliance

### Security Measures

| Layer | Implementation |
|-------|---------------|
| **DDoS Protection** | Cloudflare WAF + Rate Limiting |
| **API Security** | JWT authentication, API key rotation |
| **Database** | Row-Level Security (RLS), encrypted at rest |
| **Secrets** | GitHub Secrets + Vercel Environment Variables |
| **Vulnerability Scanning** | Snyk (dependencies), Trivy (containers) |
| **Web Security** | CSP headers, HSTS, XSS protection |

### Compliance Requirements

- **GDPR**: User data export, right to deletion
- **CCPA**: California privacy compliance
- **SOC 2**: Audit trail, access controls (future)
- **Smart Contract Audits**: CertiK or Trail of Bits (before mainnet launch)

---

## Monitoring & Observability

### Key Metrics to Track

#### Application Performance
- **Response Time**: P50, P95, P99 latencies
- **Error Rate**: 4xx and 5xx responses
- **Throughput**: Requests per second
- **Build Time**: CI/CD pipeline duration

#### Business Metrics
- **DAO Participation**: Votes per proposal, voter turnout
- **Studio Bookings**: Conversion rate, cancellation rate
- **Treasury Growth**: Inflow rate, proposal funding velocity
- **AI Digest Engagement**: Open rate, audio playback completion

#### Infrastructure Metrics
- **Database**: Query performance, connection pool usage
- **Cache Hit Rate**: Redis cache efficiency
- **CDN Performance**: Cache hit ratio, bandwidth usage
- **Web3 Transactions**: Gas usage, transaction success rate

### Alert Thresholds

```yaml
alerts:
  critical:
    - error_rate > 5%
    - response_time_p95 > 2000ms
    - database_cpu > 80%
    - proposal_voting_failure_rate > 1%

  warning:
    - error_rate > 2%
    - response_time_p95 > 1000ms
    - cache_hit_rate < 70%
    - discord_webhook_failures > 5/hour
```

---

## Incident Response

### On-Call Rotation
- **Primary**: Week-long rotation among team leads
- **Secondary**: Backend specialist
- **Escalation**: CTO (> 30 min unresolved)

### Incident Runbooks

#### Database Connection Pool Exhausted
1. Check active connections: `SELECT count(*) FROM pg_stat_activity`
2. Identify long-running queries: `SELECT pid, query, state FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes'`
3. Scale up connection pool or kill blocking queries
4. Post-incident: Optimize slow queries

#### DAO Vote Not Recording
1. Check Supabase logs for transaction errors
2. Verify wallet signature validation
3. Check for race conditions in vote counting
4. Manual vote recording if necessary + incident report

---

## Cost Optimization

### Strategies

1. **Edge Caching**: Use Vercel Edge Config for static data
2. **Image Optimization**: Next.js Image component + WebP format
3. **Database Queries**: Materialized views for analytics
4. **AI Generation**: Batch digest generation weekly vs on-demand
5. **CDN**: Cloudflare caching for static assets

### Projected Monthly Costs at Scale

| Users | Infrastructure | AI Services | Total |
|-------|---------------|-------------|-------|
| 1K | $220 | $50 | $270 |
| 10K | $380 | $200 | $580 |
| 100K | $1,200 | $800 | $2,000 |

---

## Scalability Roadmap

### Phase 1: Current (1K users)
- Single Vercel deployment
- Supabase Starter tier
- Manual digest generation

### Phase 2: Growth (10K users)
- Vercel Pro with edge functions
- Supabase Pro with read replicas
- Automated weekly digest cron

### Phase 3: Scale (100K users)
- Multi-region deployment
- Dedicated Postgres cluster
- Real-time WebSocket connections
- Horizontal scaling for API routes

---

## Development Workflow Integration

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

### Lint-staged Configuration

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Code Review Checklist

- [ ] All tests passing
- [ ] Type errors resolved
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Accessibility (WCAG AA)
- [ ] Security review (XSS, SQL injection)
- [ ] Performance impact < 100ms
- [ ] Mobile responsive
- [ ] Database migration included (if schema change)

---

## Testing Strategy

### Test Pyramid

```
           /\
          /E2E\         (10% - Critical user flows)
         /------\
        /Integration\   (30% - API routes, DB operations)
       /------------\
      /    Unit      \ (60% - Business logic, utilities)
     /----------------\
```

### Test Coverage Targets

- **Unit Tests**: 80% coverage
- **Integration Tests**: All API routes
- **E2E Tests**:
  - Studio booking flow
  - DAO proposal creation + voting
  - Member registration
  - Digest archive browsing

### Example E2E Test

```typescript
// tests/e2e/dao-voting.spec.ts
import { test, expect } from '@playwright/test';

test('DAO member can vote on proposal', async ({ page }) => {
  await page.goto('/dao/proposals/test-proposal-id');

  // Connect wallet
  await page.click('[data-testid="connect-wallet"]');
  await page.click('[data-testid="metamask-option"]');

  // Cast vote
  await page.click('[data-testid="vote-for"]');
  await page.click('[data-testid="confirm-vote"]');

  // Verify vote recorded
  await expect(page.locator('[data-testid="vote-success"]')).toBeVisible();
  await expect(page.locator('[data-testid="vote-count"]')).toContainText('1 vote');
});
```

---

## Documentation Standards

### Required Documentation

1. **API Documentation**: Swagger/OpenAPI for all endpoints
2. **Component Documentation**: Storybook for UI components
3. **Database Schema**: ERD diagrams + table descriptions
4. **Architecture Decisions**: ADR (Architecture Decision Records)
5. **Runbooks**: Incident response procedures

### Documentation Locations

```
docs/
├── api/                  # API reference
├── components/           # Component usage examples
├── architecture/         # System design docs
├── runbooks/            # Operational procedures
├── adr/                 # Architecture decisions
└── onboarding/          # New developer guide
```

---

## Disaster Recovery Plan

### Backup Systems

1. **Database**: Daily automated backups to S3
2. **Smart Contracts**: Immutable on blockchain (no backup needed)
3. **User Uploads**: Supabase Storage with versioning
4. **Configuration**: GitHub repository (version controlled)

### Recovery Time Objectives

| System | RTO | RPO |
|--------|-----|-----|
| Frontend | 15 min | 0 (stateless) |
| Database | 1 hour | 15 min |
| DAO Contracts | N/A | N/A (blockchain) |
| AI Services | 30 min | 24 hours |

### Disaster Scenarios

#### Scenario 1: Vercel Outage
1. Switch DNS to backup Netlify deployment (pre-configured)
2. Update environment variables
3. Verify functionality
4. Communicate via status page

#### Scenario 2: Database Corruption
1. Stop all write operations
2. Restore from latest backup
3. Replay WAL logs to minimize data loss
4. Verify data integrity
5. Resume operations

---

## Performance Budgets

### Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms

### Bundle Size Limits

- **Initial JS**: < 200KB gzipped
- **CSS**: < 50KB gzipped
- **Images**: WebP format, < 500KB each

### Lighthouse Score Targets

- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 95
- **SEO**: > 90

---

## Compliance & Legal

### Data Retention Policy

| Data Type | Retention | Deletion Method |
|-----------|-----------|-----------------|
| User profiles | Account lifetime + 30 days | Hard delete |
| DAO votes | Permanent (on-chain) | N/A |
| Studio bookings | 7 years (tax compliance) | Anonymize PII |
| AI digests | Permanent (archive) | N/A |
| Error logs | 90 days | Automatic purge |

### Privacy Policy Requirements

- Cookie consent (GDPR)
- Data processing agreements
- User data export API
- Right to deletion workflow
- Privacy policy versioning

---

## Success Metrics

### DevOps KPIs

- **Deployment Frequency**: Daily (develop), Weekly (main)
- **Lead Time for Changes**: < 4 hours (feature → production)
- **Mean Time to Recovery**: < 1 hour
- **Change Failure Rate**: < 5%

### Infrastructure KPIs

- **Uptime**: 99.9% (43 minutes downtime/month allowed)
- **API Response Time**: P95 < 500ms
- **Error Rate**: < 0.1%
- **Cache Hit Rate**: > 80%

---

## Roadmap Integration

This DevOps plan supports the 6-phase development roadmap:

| Phase | DevOps Focus |
|-------|--------------|
| **Phase 1: Studio Booking** | Email delivery, payment webhooks, booking confirmations |
| **Phase 2: DAO Governance** | Web3 wallet integration, transaction monitoring, vote recording |
| **Phase 3: Treasury Analytics** | Real-time data sync, chart.js optimization, materialized views |
| **Phase 4: AI Digest** | Cron job scheduling, OpenAI rate limiting, audio CDN |
| **Phase 5: Transparency** | Public API caching, embed performance, auto-refresh |
| **Phase 6: Member Dashboard** | Authentication flow, session management, NFT card generation |

---

## Conclusion

This DevOps plan provides the operational foundation for **inRECORD** to scale from prototype to production-grade platform. Key priorities:

1. **Automation First**: CI/CD, testing, monitoring
2. **Security by Design**: RLS, secrets management, compliance
3. **Observability**: Metrics, logs, alerts
4. **Cost Efficiency**: Caching, optimization, right-sizing
5. **Developer Experience**: Fast feedback loops, clear documentation

**Next Steps:**
1. Review and approve DevOps plan
2. Set up monitoring infrastructure (Datadog + Sentry)
3. Configure GitHub Actions CI/CD
4. Establish on-call rotation
5. Begin Phase 1 implementation with DevOps integration

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Maintained By:** inRECORD DevOps Team
