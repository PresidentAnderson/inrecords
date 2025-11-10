/**
 * Email service for booking confirmations using Resend
 */

import { Resend } from 'resend';
import type { StudioSession } from '../supabase/types';
import { format } from 'date-fns';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'bookings@inrecord.io';
const ADMIN_EMAIL = 'admin@inrecord.io';

/**
 * Format booking details for email
 */
function formatBookingDetails(booking: StudioSession): string {
  const sessionDate = format(new Date(booking.session_date), 'MMMM d, yyyy');
  const sessionTime = booking.session_time.substring(0, 5); // HH:MM format

  return `
Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID: ${booking.id}
Room Type: ${booking.room_type.charAt(0).toUpperCase() + booking.room_type.slice(1)}
Date: ${sessionDate}
Time: ${sessionTime}
Duration: ${booking.duration_hours} hour(s)
Total Cost: $${booking.total_cost?.toFixed(2)}
Status: ${booking.status.toUpperCase()}
${booking.dao_funded ? 'DAO Funded: Yes' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}

/**
 * Send booking confirmation email to user
 */
export async function sendBookingConfirmation(
  booking: StudioSession
): Promise<{ success: boolean; error?: string }> {
  try {
    const details = formatBookingDetails(booking);

    const { error } = await resend.emails.send({
      from: `inRECORD Studio <${FROM_EMAIL}>`,
      to: booking.user_email,
      subject: 'Studio Booking Confirmation - inRECORD',
      text: `
Hello ${booking.user_name || 'there'},

Thank you for booking with inRECORD! Your studio session has been received and is pending confirmation.

${details}

${booking.notes ? `\nYour Notes:\n${booking.notes}\n` : ''}

What's Next?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. You will receive a confirmation email once your booking is approved
2. Please arrive 10 minutes early for setup
3. Bring your project files on a USB drive or external hard drive
4. Our team will reach out if we need any additional information

Need to make changes?
Reply to this email or contact us at ${ADMIN_EMAIL}

Best regards,
The inRECORD Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
inRECORD - Music Studio & Creative DAO
Website: https://inrecord.io
Email: ${ADMIN_EMAIL}
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">inRECORD Studio</h1>
    <p style="margin: 10px 0 0; opacity: 0.9;">Booking Confirmation</p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-top: 0;">Hello <strong>${booking.user_name || 'there'}</strong>,</p>

    <p>Thank you for booking with inRECORD! Your studio session has been received and is pending confirmation.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Booking Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${booking.id.substring(0, 8)}...</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Room Type:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.room_type.charAt(0).toUpperCase() + booking.room_type.slice(1)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${format(new Date(booking.session_date), 'MMMM d, yyyy')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.session_time.substring(0, 5)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Duration:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.duration_hours} hour(s)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Total Cost:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; color: #667eea; font-weight: bold;">$${booking.total_cost?.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Status:</strong></td>
          <td style="padding: 8px 0; text-align: right;">
            <span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: uppercase; font-weight: bold;">
              ${booking.status}
            </span>
          </td>
        </tr>
        ${booking.dao_funded ? `
        <tr>
          <td style="padding: 8px 0;"><strong>DAO Funded:</strong></td>
          <td style="padding: 8px 0; text-align: right;">
            <span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">
              YES
            </span>
          </td>
        </tr>
        ` : ''}
      </table>
    </div>

    ${booking.notes ? `
    <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h3 style="margin-top: 0; color: #92400e; font-size: 16px;">Your Notes</h3>
      <p style="margin: 0; color: #78350f;">${booking.notes}</p>
    </div>
    ` : ''}

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #667eea; font-size: 18px;">What's Next?</h3>
      <ol style="margin: 0; padding-left: 20px; color: #666;">
        <li style="margin-bottom: 10px;">You will receive a confirmation email once your booking is approved</li>
        <li style="margin-bottom: 10px;">Please arrive 10 minutes early for setup</li>
        <li style="margin-bottom: 10px;">Bring your project files on a USB drive or external hard drive</li>
        <li>Our team will reach out if we need any additional information</li>
      </ol>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
      <p style="margin: 10px 0; color: #666;">Need to make changes?</p>
      <p style="margin: 10px 0;">
        <a href="mailto:${ADMIN_EMAIL}" style="color: #667eea; text-decoration: none; font-weight: bold;">Contact Us</a>
      </p>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p style="margin: 5px 0;">inRECORD - Music Studio & Creative DAO</p>
    <p style="margin: 5px 0;">
      <a href="https://inrecord.io" style="color: #667eea; text-decoration: none;">inrecord.io</a>
    </p>
  </div>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error('Error sending booking confirmation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send booking notification to admin
 */
export async function sendAdminNotification(
  booking: StudioSession
): Promise<{ success: boolean; error?: string }> {
  try {
    const details = formatBookingDetails(booking);

    const { error } = await resend.emails.send({
      from: `inRECORD Bookings <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `New Studio Booking: ${booking.room_type} - ${booking.session_date}`,
      text: `
New studio booking received!

Customer Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${booking.user_name}
Email: ${booking.user_email}
Phone: ${booking.user_phone || 'Not provided'}
${booking.user_wallet ? `Wallet: ${booking.user_wallet}` : ''}

${details}

${booking.notes ? `\nCustomer Notes:\n${booking.notes}\n` : ''}

Actions Required:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Review the booking details
2. Confirm availability in the studio calendar
3. Update booking status to 'confirmed' in admin dashboard
4. Customer will receive automatic confirmation email

View in Admin Dashboard:
https://inrecord.io/admin/bookings/${booking.id}
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Notification</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">New Studio Booking</h1>
    <p style="margin: 10px 0 0; opacity: 0.9;">Admin Notification</p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
      <p style="margin: 0; color: #991b1b; font-weight: bold;">Action Required: New booking needs confirmation</p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #d97706; font-size: 20px;">Customer Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.user_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><a href="mailto:${booking.user_email}" style="color: #d97706;">${booking.user_email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.user_phone || 'Not provided'}</td>
        </tr>
        ${booking.user_wallet ? `
        <tr>
          <td style="padding: 8px 0;"><strong>Wallet:</strong></td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 11px;">${booking.user_wallet}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
      <h2 style="margin-top: 0; color: #d97706; font-size: 20px;">Booking Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Room Type:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.room_type.charAt(0).toUpperCase() + booking.room_type.slice(1)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${format(new Date(booking.session_date), 'MMMM d, yyyy')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.session_time.substring(0, 5)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Duration:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.duration_hours} hour(s)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Total Cost:</strong></td>
          <td style="padding: 8px 0; text-align: right; color: #d97706; font-weight: bold;">$${booking.total_cost?.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    ${booking.notes ? `
    <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #92400e; font-size: 16px;">Customer Notes</h3>
      <p style="margin: 0; color: #78350f;">${booking.notes}</p>
    </div>
    ` : ''}

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #d97706; font-size: 18px;">Actions Required</h3>
      <ol style="margin: 0; padding-left: 20px; color: #666;">
        <li style="margin-bottom: 10px;">Review the booking details</li>
        <li style="margin-bottom: 10px;">Confirm availability in the studio calendar</li>
        <li style="margin-bottom: 10px;">Update booking status to 'confirmed' in admin dashboard</li>
        <li>Customer will receive automatic confirmation email</li>
      </ol>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://inrecord.io/admin/bookings/${booking.id}"
         style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        View in Admin Dashboard
      </a>
    </div>
  </div>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error('Error sending admin notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send booking status update email
 */
export async function sendStatusUpdateEmail(
  booking: StudioSession,
  oldStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const details = formatBookingDetails(booking);
    const statusMessages = {
      confirmed: {
        subject: 'Booking Confirmed',
        message: 'Great news! Your studio booking has been confirmed.',
        color: '#10b981',
      },
      cancelled: {
        subject: 'Booking Cancelled',
        message: 'Your studio booking has been cancelled.',
        color: '#ef4444',
      },
      completed: {
        subject: 'Session Completed',
        message: 'Thank you for your session! We hope it was productive.',
        color: '#8b5cf6',
      },
    };

    const statusInfo = statusMessages[booking.status as keyof typeof statusMessages];
    if (!statusInfo) {
      return { success: true }; // Skip email for unknown status
    }

    const { error } = await resend.emails.send({
      from: `inRECORD Studio <${FROM_EMAIL}>`,
      to: booking.user_email,
      subject: `${statusInfo.subject} - inRECORD`,
      text: `
Hello ${booking.user_name || 'there'},

${statusInfo.message}

${details}

${booking.status === 'confirmed' ? `
Preparation Checklist:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Arrive 10 minutes early for setup
✓ Bring project files on USB/external drive
✓ Review our studio guidelines
✓ Come ready to create!
` : ''}

${booking.status === 'cancelled' ? `
If you'd like to reschedule, please visit our booking page or contact us directly.
` : ''}

Questions? Reply to this email or contact us at ${ADMIN_EMAIL}

Best regards,
The inRECORD Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${statusInfo.color}; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">${statusInfo.subject}</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hello <strong>${booking.user_name || 'there'}</strong>,</p>
    <p>${statusInfo.message}</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusInfo.color};">
      <h2 style="margin-top: 0; color: ${statusInfo.color};">Booking Details</h2>
      <p style="margin: 0; white-space: pre-line; font-family: monospace; font-size: 13px;">${details}</p>
    </div>

    ${booking.status === 'confirmed' ? `
    <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #065f46;">Preparation Checklist</h3>
      <ul style="margin: 0; padding-left: 20px; color: #047857;">
        <li>Arrive 10 minutes early for setup</li>
        <li>Bring project files on USB/external drive</li>
        <li>Review our studio guidelines</li>
        <li>Come ready to create!</li>
      </ul>
    </div>
    ` : ''}

    <p style="text-align: center; margin-top: 30px;">
      Questions? <a href="mailto:${ADMIN_EMAIL}" style="color: ${statusInfo.color};">Contact us</a>
    </p>
  </div>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error('Error sending status update email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending status update email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
