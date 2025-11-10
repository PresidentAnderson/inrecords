# Phase 4: AI Digest System - Quick Start Guide

## TL;DR

Phase 4 is **100% complete**. This guide gets you from zero to production in 10 minutes.

---

## Pre-Deployment Checklist

### ✅ What's Already Done

- [x] Database schema created (`20250125_ai_digests.sql`)
- [x] TypeScript types and Zod schemas
- [x] OpenAI integration service
- [x] Text-to-speech service
- [x] Distribution service (Discord + Email)
- [x] Cron job API route
- [x] Digest archive page
- [x] Individual digest page
- [x] Dependencies installed
- [x] Navigation updated
- [x] Documentation written

### ⏳ What You Need to Do (5 steps)

1. Set up environment variables
2. Run database migration
3. Create Supabase storage bucket
4. Test manual digest generation
5. Verify cron job

---

## Step-by-Step Setup (10 minutes)

### Step 1: Environment Variables (2 min)

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in these required values:

```bash
# Supabase (from dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI (from platform.openai.com)
OPENAI_API_KEY=sk-proj-...
OPENAI_ORG_ID=org-...

# Resend (from resend.com)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=digest@yourdomain.com

# Discord (webhook URL)
DISCORD_DIGEST_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Play.ht (from play.ht)
PLAYHT_API_KEY=...
PLAYHT_USER_ID=...

# App config
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
CRON_SECRET=generate-a-random-secret-here

# Environment
NODE_ENV=production
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

### Step 2: Database Migration (2 min)

**Option A: Using Supabase CLI (Recommended)**
```bash
# Link your project
supabase link --project-ref your-project-ref

# Push migration
supabase db push
```

**Option B: Using Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20250125_ai_digests.sql`
3. Paste and run

**Verify:**
```sql
SELECT * FROM ai_digests LIMIT 1;
SELECT * FROM digest_distributions LIMIT 1;
```

Should return empty results (tables exist).

### Step 3: Create Storage Bucket (1 min)

In Supabase Dashboard:

1. Go to **Storage**
2. Click **Create Bucket**
3. Name: `audio`
4. Set to **Public**
5. Click **Create**

**Verify:**
```bash
# Should list the audio bucket
curl https://xxxxx.supabase.co/storage/v1/bucket
```

### Step 4: Test Manual Generation (3 min)

**Install dependencies (if not already):**
```bash
npm install
```

**Start development server:**
```bash
npm run dev
```

**Trigger manual digest generation:**
```bash
curl -X POST http://localhost:3000/api/cron/digest \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "week_start": "2025-01-08",
    "week_end": "2025-01-14",
    "force_regenerate": true,
    "auto_distribute": false
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "digest_id": "uuid-here",
  "week_start": "2025-01-08",
  "week_end": "2025-01-14",
  "digest_url": "https://yourdomain.com/digests/week-2025-01-08"
}
```

**View the digest:**
Open `http://localhost:3000/digests`

### Step 5: Deploy to Vercel (2 min)

**Deploy:**
```bash
vercel deploy --prod
```

**Add environment variables in Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy if needed

**Verify cron job:**
1. Go to Vercel Dashboard → Cron
2. Should show: `/api/cron/digest` scheduled for Mondays at 9 AM UTC

---

## Verification Checklist

After deployment, verify:

- [ ] Visit `https://yourdomain.com/digests` → Should show empty state
- [ ] Trigger manual generation (see Step 4)
- [ ] Refresh digests page → Should show 1 digest
- [ ] Click digest → Should load detail page
- [ ] Switch languages (EN/FR/PT) → Content changes
- [ ] Play audio → Should play narration
- [ ] Check Discord → Should have webhook message (if auto_distribute: true)
- [ ] Check email → Should receive newsletter (if subscribers exist)
- [ ] Check Vercel logs → No errors
- [ ] Check Supabase logs → Queries successful

---

## Troubleshooting

### Issue: "Digest generation failed"

**Check:**
1. OpenAI API key is valid
2. Supabase credentials are correct
3. Database tables exist
4. DAO tables have data (or use mock data)

**Solution:**
```bash
# Test with mock data
curl -X POST http://localhost:3000/api/cron/digest \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "week_start": "2025-01-08",
    "week_end": "2025-01-14",
    "force_regenerate": true
  }'
```

### Issue: "Audio generation failed"

**Check:**
1. Play.ht API key and User ID
2. Supabase storage bucket exists
3. Storage bucket is public

**Workaround:**
Audio generation fails gracefully. Digest will be saved without audio.

### Issue: "Discord/Email distribution failed"

**Check:**
1. Discord webhook URL is correct
2. Resend API key is valid
3. Email domain is verified in Resend

**Workaround:**
Distribution fails gracefully. Digest is still saved and published.

### Issue: "Cron job not running"

**Check:**
1. `vercel.json` is in project root
2. Cron job appears in Vercel Dashboard
3. CRON_SECRET is set in Vercel environment variables

**Manual trigger:**
```bash
curl -X GET https://yourdomain.com/api/cron/digest?force=true \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Testing the System

### Test 1: Generate Digest

```bash
curl -X POST https://yourdomain.com/api/cron/digest \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "week_start": "2025-01-08",
    "week_end": "2025-01-14",
    "force_regenerate": true,
    "auto_distribute": true
  }'
```

### Test 2: View Archive

Open: `https://yourdomain.com/digests`

### Test 3: View Individual Digest

Open: `https://yourdomain.com/digests/week-2025-01-08`

### Test 4: Filter by Sentiment

Click sentiment filter buttons on archive page.

### Test 5: Language Switching

On individual digest page, click FR or PT buttons.

### Test 6: Audio Playback

Click play button on audio player.

---

## Monitoring

### Vercel Dashboard
- Functions → `/api/cron/digest` → View logs
- Cron Jobs → Status and next execution

### Supabase Dashboard
- Database → Logs → Query performance
- Storage → Audio bucket → File uploads
- Authentication → Not used for digests

### OpenAI Dashboard
- Usage → API calls and costs
- Should see ~4 calls per digest

### Resend Dashboard
- Emails → Delivery status
- Should show sent emails

---

## Cost Tracking

Monitor these metrics:

| Service | Expected Cost | Monitor At |
|---------|--------------|------------|
| OpenAI | ~$0.19/digest | platform.openai.com |
| Play.ht | ~$0.05/digest | play.ht |
| Resend | $0 (free tier) | resend.com |
| Supabase | $0 (free tier) | supabase.com |
| Vercel | $0 (hobby) | vercel.com |
| **Total** | **~$0.24/digest** | |

**Monthly:** ~$0.96 (4 digests)

---

## Next Steps

After successful deployment:

1. **Wait for First Automatic Run**
   - Next Monday at 9 AM UTC
   - Check Vercel logs
   - Verify digest was created

2. **Review Generated Content**
   - Check quality of summaries
   - Verify translations are accurate
   - Listen to audio narration

3. **Gather Feedback**
   - Share with community
   - Collect improvement ideas
   - Monitor engagement

4. **Optimize**
   - Adjust system prompts if needed
   - Fine-tune email template
   - Add more voice options

5. **Phase 5 & 6**
   - Implement remaining features
   - Build transparency portal
   - Create member dashboard

---

## Support Resources

- **Full Documentation:** `PHASE4_README.md`
- **Implementation Details:** `PHASE4_IMPLEMENTATION_SUMMARY.md`
- **Environment Template:** `.env.example`
- **Vercel Docs:** https://vercel.com/docs/cron-jobs
- **Supabase Docs:** https://supabase.com/docs
- **OpenAI Docs:** https://platform.openai.com/docs
- **Play.ht Docs:** https://docs.play.ht
- **Resend Docs:** https://resend.com/docs

---

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
supabase link                  # Link to project
supabase db push               # Push migration
supabase db reset              # Reset database

# Deployment
vercel deploy                  # Deploy to preview
vercel deploy --prod           # Deploy to production

# Testing
curl http://localhost:3000/api/cron/digest \
  -H "Authorization: Bearer SECRET"

# Logs
vercel logs                    # View deployment logs
vercel logs --follow           # Stream logs
```

---

## Success Indicators

Your Phase 4 is successful when:

- ✅ Cron job runs automatically every Monday
- ✅ Digest appears on `/digests` page
- ✅ Audio plays correctly in all languages
- ✅ Discord receives webhook message
- ✅ Emails are delivered to subscribers
- ✅ No errors in Vercel logs
- ✅ OpenAI costs stay under $0.25/digest
- ✅ Page load times under 2 seconds
- ✅ Mobile responsiveness works perfectly

---

## Emergency Contacts

If something breaks:

1. Check Vercel logs first
2. Check Supabase logs second
3. Review environment variables
4. Test with manual trigger
5. Check API quotas (OpenAI, Play.ht, Resend)

**Most Common Issues:**
- Missing environment variable
- Database migration not run
- Storage bucket not created
- CRON_SECRET mismatch
- API quota exceeded

---

**That's it!** Phase 4 should now be fully operational. 🚀

**Questions?** Check `PHASE4_README.md` for detailed information.
