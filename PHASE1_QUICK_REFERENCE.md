# Phase 1: Studio Booking System - Quick Reference

## URLs

### Public Pages
- **Booking Page:** `/book-session`
- **Home:** `/`

### Admin Pages
- **Bookings Dashboard:** `/admin/bookings`

### API Endpoints

#### Public APIs
```
GET  /api/bookings/pricing                    # Get room pricing
GET  /api/bookings/availability               # Check time slots
     ?date=2025-01-20&roomType=recording
GET  /api/bookings?email=user@example.com     # Get user bookings
POST /api/bookings                             # Create booking
```

#### Admin APIs (⚠️ Need Authentication)
```
GET    /api/admin/bookings                    # Get all bookings
       ?status=pending&roomType=recording
GET    /api/admin/bookings/stats              # Get statistics
PATCH  /api/admin/bookings/:id                # Update booking
DELETE /api/admin/bookings/:id                # Delete booking
```

## Database Tables

### studio_sessions
```sql
id              UUID PRIMARY KEY
user_email      TEXT NOT NULL
user_name       TEXT
user_phone      TEXT
user_wallet     TEXT
room_type       TEXT (enum)
session_date    DATE
session_time    TIME
duration_hours  INTEGER
status          TEXT (enum)
total_cost      DECIMAL
dao_funded      BOOLEAN
notes           TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### room_pricing
```sql
id              UUID PRIMARY KEY
room_type       TEXT UNIQUE
hourly_rate     DECIMAL
description     TEXT
features        TEXT[]
created_at      TIMESTAMP
```

## Room Types

| Type       | Default Rate | Description                              |
|------------|--------------|------------------------------------------|
| recording  | $75/hr       | Professional recording with vocal booth  |
| mixing     | $60/hr       | Dedicated mixing suite                   |
| mastering  | $80/hr       | Acoustically treated mastering room      |
| podcast    | $50/hr       | Podcast setup for up to 4 people        |
| rehearsal  | $30/hr       | Rehearsal space with backline           |

## Booking Statuses

- **pending** - Awaiting admin confirmation
- **confirmed** - Approved by admin
- **completed** - Session finished
- **cancelled** - Booking cancelled

## Status Flow

```
pending → confirmed → completed
   ↓
cancelled
```

## Email Templates

1. **Booking Confirmation** → User
   - Sent immediately after booking
   - Contains booking details
   - Status: pending

2. **Admin Notification** → Admin
   - New booking alert
   - Customer contact info
   - Link to admin dashboard

3. **Status Update** → User
   - Sent when status changes
   - confirmed/cancelled/completed
   - Includes preparation checklist (if confirmed)

## Key Functions

### Public Functions (`lib/supabase/bookings.ts`)
```typescript
getRoomPricing()                              # Get all room pricing
getRoomPricingByType(roomType)                # Get specific room pricing
calculateBookingCost(roomType, hours)         # Calculate total cost
checkAvailability(date, roomType)             # Get available slots
createBooking(bookingData)                    # Create new booking
getBookingById(id)                            # Get booking details
getBookingsByEmail(email)                     # Get user's bookings
```

### Admin Functions (Require service role)
```typescript
getAllBookings(filters?)                      # Get all bookings
updateBooking(id, updates)                    # Update booking
deleteBooking(id)                             # Delete booking
getBookingStats()                             # Get statistics
updateBookingStatus(id, status)               # Change status
updateDaoFundingStatus(id, funded)            # Toggle DAO funding
```

### Email Functions (`lib/email/booking-confirmation.ts`)
```typescript
sendBookingConfirmation(booking)              # Send to user
sendAdminNotification(booking)                # Send to admin
sendStatusUpdateEmail(booking, oldStatus)     # Status change email
```

## Configuration

### Time Slots
- **Hours:** 9 AM - 9 PM (defined in `checkAvailability()`)
- **Interval:** 1 hour
- **Max Duration:** 12 hours

### Email Settings
```typescript
// lib/email/booking-confirmation.ts
const FROM_EMAIL = 'bookings@inrecord.io'
const ADMIN_EMAIL = 'admin@inrecord.io'
```

### Validation Rules
- Email: Valid email format
- Phone: Minimum 10 characters
- Name: Minimum 2 characters
- Duration: 1-12 hours
- Date: Future dates only

## Quick Commands

### Database
```sql
-- Get all pending bookings
SELECT * FROM studio_sessions WHERE status = 'pending';

-- Get bookings for today
SELECT * FROM studio_sessions WHERE session_date = CURRENT_DATE;

-- Get total revenue
SELECT SUM(total_cost) FROM studio_sessions WHERE status = 'completed';

-- Get DAO funded bookings
SELECT * FROM studio_sessions WHERE dao_funded = true;

-- Update room pricing
UPDATE room_pricing SET hourly_rate = 85.00 WHERE room_type = 'recording';
```

### API Testing
```bash
# Get pricing
curl http://localhost:3000/api/bookings/pricing

# Check availability
curl "http://localhost:3000/api/bookings/availability?date=2025-01-20&roomType=recording"

# Create booking (POST with JSON body)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"user_email":"test@example.com","user_name":"Test User",...}'

# Get user bookings
curl "http://localhost:3000/api/bookings?email=test@example.com"
```

## Troubleshooting

### Issue: Availability not showing
- Check if date is in the future
- Verify room type is valid
- Check browser console for errors
- Ensure Supabase connection is working

### Issue: Emails not sending
- Verify RESEND_API_KEY is set
- Check sender email is verified
- Look for errors in server logs
- Test with Resend dashboard

### Issue: Can't create booking
- Verify all required fields filled
- Check time slot is available
- Ensure date is in future
- Check server logs for errors

### Issue: Admin dashboard empty
- Verify Supabase connection
- Check SUPABASE_SERVICE_KEY is set
- Ensure bookings exist in database
- Check browser console for errors

## Important Notes

⚠️ **BEFORE PRODUCTION:**
1. Fix syntax errors in `app/page.tsx` and `app/academy/page.tsx`
2. Implement authentication system
3. Protect admin routes with auth middleware
4. Add admin role checks in API endpoints
5. Test thoroughly in staging environment
6. Verify email delivery in production
7. Run database migration on production database
8. Update email addresses in code

## Environment Variables

Required for Phase 1:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
RESEND_API_KEY=
```

## File Locations

```
Database Schema:
  supabase/migrations/20250110_studio_sessions.sql

Backend:
  lib/supabase/client.ts
  lib/supabase/types.ts
  lib/supabase/bookings.ts
  lib/email/booking-confirmation.ts

API Routes:
  app/api/bookings/route.ts
  app/api/bookings/availability/route.ts
  app/api/bookings/pricing/route.ts
  app/api/admin/bookings/route.ts
  app/api/admin/bookings/stats/route.ts
  app/api/admin/bookings/[id]/route.ts

Frontend:
  components/BookingForm.tsx
  app/book-session/page.tsx
  app/admin/bookings/page.tsx

Documentation:
  PHASE1_SETUP.md
  PHASE1_IMPLEMENTATION_SUMMARY.md
  PHASE1_QUICK_REFERENCE.md (this file)
```

## Contact & Support

For detailed setup: See `PHASE1_SETUP.md`
For implementation details: See `PHASE1_IMPLEMENTATION_SUMMARY.md`
For overall plan: See `DEVELOPMENT_PLAN.md`

---
Quick Reference v1.0 | Phase 1: Studio Booking System
