# Phase 1: Studio Booking System - Setup Guide

This guide will help you set up and deploy the Studio Booking System for inRECORD.

## Overview

Phase 1 implements a complete studio booking system with:
- Professional booking form with real-time availability checking
- Email confirmations for customers and admin notifications
- Admin dashboard for managing bookings
- DAO funding integration
- Production-ready error handling and validation

## Files Created

### Database
- `supabase/migrations/20250110_studio_sessions.sql` - Database schema for studio sessions and room pricing

### Backend/API
- `lib/supabase/client.ts` - Supabase client configuration
- `lib/supabase/types.ts` - TypeScript types for database schema
- `lib/supabase/bookings.ts` - Database operations for bookings
- `lib/email/booking-confirmation.ts` - Email service using Resend

### API Routes
- `app/api/bookings/route.ts` - Create and fetch bookings
- `app/api/bookings/availability/route.ts` - Check time slot availability
- `app/api/bookings/pricing/route.ts` - Get room pricing
- `app/api/admin/bookings/route.ts` - Admin: Fetch all bookings
- `app/api/admin/bookings/stats/route.ts` - Admin: Booking statistics
- `app/api/admin/bookings/[id]/route.ts` - Admin: Update/delete bookings

### Frontend
- `components/BookingForm.tsx` - Booking form component
- `app/book-session/page.tsx` - Public booking page
- `app/admin/bookings/page.tsx` - Admin dashboard

## Prerequisites

1. **Supabase Account**
   - Create a project at [supabase.com](https://supabase.com)
   - Note your project URL and API keys

2. **Resend Account**
   - Sign up at [resend.com](https://resend.com)
   - Verify your domain (or use test mode)
   - Get your API key

## Setup Instructions

### 1. Install Dependencies

Dependencies have already been installed:
```bash
npm install @supabase/supabase-js resend date-fns zod
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Update the following variables in `.env.local`:

```env
# Supabase (REQUIRED for Phase 1)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend Email (REQUIRED for Phase 1)
RESEND_API_KEY=re_your-resend-api-key
RESEND_FROM_EMAIL=bookings@inrecord.io  # or your verified domain
```

### 3. Run Database Migration

Apply the database migration in Supabase:

**Option A: Using Supabase CLI**
```bash
supabase migration up
```

**Option B: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250110_studio_sessions.sql`
4. Click "Run"

### 4. Verify Database Setup

After running the migration, verify these tables exist:
- `studio_sessions` - Stores booking data
- `room_pricing` - Room types and hourly rates

Check that the default room pricing has been inserted:
```sql
SELECT * FROM room_pricing;
```

You should see 5 room types: recording, mixing, mastering, podcast, rehearsal.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing the Booking System

### 1. Test Public Booking Flow

1. Navigate to `http://localhost:3000/book-session`
2. Fill out the booking form:
   - Personal information (name, email, phone)
   - Optional: Connect wallet address
   - Select room type
   - Choose date (must be future date)
   - Select available time slot
   - Choose duration (1-12 hours)
   - Add notes (optional)
3. Click "Book Session"
4. Check for:
   - Success message on the page
   - Confirmation email to the user's email address
   - Admin notification email

### 2. Test Admin Dashboard

1. Navigate to `http://localhost:3000/admin/bookings`
2. View statistics dashboard:
   - Total bookings
   - Status breakdown (pending, confirmed, completed, cancelled)
   - DAO funded count
   - Total revenue
3. Test filtering by:
   - Status
   - Room type
   - Date range
4. Test booking actions:
   - Click "View" to see booking details
   - Confirm pending bookings
   - Mark confirmed bookings as completed
   - Toggle DAO funding status
   - Cancel bookings

### 3. Test API Endpoints

**Check Room Pricing:**
```bash
curl http://localhost:3000/api/bookings/pricing
```

**Check Availability:**
```bash
curl "http://localhost:3000/api/bookings/availability?date=2025-01-20&roomType=recording"
```

**Get User Bookings:**
```bash
curl "http://localhost:3000/api/bookings?email=user@example.com"
```

## Configuration

### Room Pricing

To update room pricing, modify the database directly:

```sql
UPDATE room_pricing
SET hourly_rate = 85.00
WHERE room_type = 'recording';
```

Or add new room types:

```sql
INSERT INTO room_pricing (room_type, hourly_rate, description, features)
VALUES (
  'live_room',
  100.00,
  'Live room with full band setup',
  ARRAY['Full Backline', 'Multi-track Recording', 'Video Capture']
);
```

### Email Templates

Email templates are defined in `lib/email/booking-confirmation.ts`. To customize:

1. Update the `FROM_EMAIL` and `ADMIN_EMAIL` constants
2. Modify the email templates in the functions:
   - `sendBookingConfirmation()` - User confirmation email
   - `sendAdminNotification()` - Admin notification
   - `sendStatusUpdateEmail()` - Status change notifications

### Availability Hours

Time slots are configured in `lib/supabase/bookings.ts` in the `checkAvailability()` function. Default hours are 9 AM to 9 PM. To change:

```typescript
// Update this line in checkAvailability():
for (let hour = 9; hour <= 21; hour++) {  // Change these values
```

## Security Considerations

### Row Level Security (RLS)

The database migration includes RLS policies:
- Public users can read all sessions (for availability checking)
- Users can insert their own bookings
- Users can only update their own bookings
- Admin (service role) has full access

### Admin Authentication

**IMPORTANT:** The admin endpoints currently do NOT have authentication implemented. Before deploying to production, you MUST add authentication:

1. Implement user authentication (e.g., NextAuth.js, Supabase Auth)
2. Add role-based access control
3. Update admin API routes to verify user role
4. Protect `/admin/*` routes with middleware

Example middleware for admin routes:
```typescript
// Add to each admin API route
const session = await getServerSession();
if (!session || session.user.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Troubleshooting

### Database Connection Issues

If you see errors connecting to Supabase:
1. Verify environment variables are set correctly
2. Check that Supabase project is not paused
3. Confirm API keys are valid (regenerate if needed)

### Email Not Sending

If emails aren't being sent:
1. Verify RESEND_API_KEY is correct
2. Check that sender email is verified in Resend
3. Look for errors in server logs
4. Test with Resend's test mode first

### Booking Creation Fails

If bookings fail to create:
1. Check browser console for validation errors
2. Verify all required fields are filled
3. Ensure selected time slot is available
4. Check server logs for database errors

### TypeScript Errors

If you see type errors:
1. Run `npm run build` to check for errors
2. Ensure all imports are correct
3. Verify `@/` path alias is configured in `tsconfig.json`

## Next Steps

After Phase 1 is complete and tested:

1. **Add Authentication**
   - Implement user authentication system
   - Protect admin routes
   - Add user login/registration

2. **Integrate Payment Processing**
   - Add Stripe/payment gateway
   - Process booking payments
   - Handle refunds for cancellations

3. **Add Calendar Integration**
   - Sync with Google Calendar
   - Add iCal export
   - Calendar view for admin

4. **Implement Phase 2: DAO Governance**
   - Create proposal system
   - Build voting mechanism
   - Integrate DAO funding for bookings

## Support

For issues or questions:
- Review DEVELOPMENT_PLAN.md for overall architecture
- Check DEVOPS.md for deployment instructions
- Open an issue in the project repository

## Success Criteria

Phase 1 is complete when:
- ✅ Users can successfully book studio sessions
- ✅ Availability checking works correctly
- ✅ Email confirmations are sent to users and admin
- ✅ Admin can view and manage all bookings
- ✅ DAO funding toggle works
- ✅ All data is persisted in Supabase
- ✅ No TypeScript or runtime errors
- ✅ Responsive design works on mobile and desktop
