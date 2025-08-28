# Order Receipt Feature

This feature automatically sends order receipts to customers via email and/or SMS after successful checkout.

## Features

- **Email Receipts**: Beautiful HTML receipts with order details
- **SMS Receipts**: Concise text receipts for mobile devices
- **Flexible Preferences**: Customers can choose email, SMS, or both
- **Automatic Sending**: Receipts are sent immediately after order placement
- **Error Handling**: System continues to work even if receipt sending fails

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 2. Gmail Setup (Email)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `EMAIL_APP_PASSWORD`

### 3. Twilio Setup (SMS)

1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token from the dashboard
3. Purchase a phone number for sending SMS
4. Add the credentials to your `.env` file

### 4. Testing

Run the test script to verify functionality:

```bash
cd server
node test-receipt.js
```

## How It Works

### User Registration
- New users can provide phone number and receipt preference during registration
- Options: Email Only, SMS Only, or Both

### Order Placement
1. Customer places order through checkout
2. Order is saved to database
3. Receipt service is called asynchronously
4. Receipt is sent based on user's preference
5. Order completion continues regardless of receipt status

### Receipt Content

#### Email Receipt Includes:
- Order ID and customer details
- Complete item list with customizations
- Pricing breakdown
- Payment and pickup information
- Professional HTML formatting

#### SMS Receipt Includes:
- Order ID and basic details
- Item summary
- Total amount
- Pickup information
- Concise text format

## File Structure

```
server/
├── services/
│   └── receiptService.js      # Main receipt service
├── routes/
│   ├── orders.js              # Updated with receipt sending
│   └── auth.js                # Updated for phone/receipt preference
├── models/
│   └── User.js                # Updated with phone and preference fields
├── test-receipt.js            # Test script
└── .env.example               # Environment variables template

client/
├── pages/
│   └── Register.js            # Updated with phone and preference fields
├── contexts/
│   └── AuthContext.js         # Updated to handle new registration fields
└── pages/
    └── Checkout.js            # Updated success message
```

## API Endpoints

### Registration
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+8801712345678",        // Optional
  "receiptPreference": "both"       // email | sms | both
}
```

### Order Creation
```javascript
POST /api/orders
// Automatically sends receipt after successful order creation
```

## Error Handling

- If email/SMS service is unavailable, order still completes
- Errors are logged but don't affect order processing
- System gracefully handles missing user contact information
- Invalid phone numbers are validated during registration

## Security Considerations

- Email credentials are stored securely in environment variables
- Twilio credentials are protected
- User phone numbers are validated for Bangladeshi format
- Receipt sending happens server-side only

## Troubleshooting

### Email Not Sending
1. Check Gmail App Password is correct
2. Verify 2FA is enabled on Gmail account
3. Check server logs for specific error messages

### SMS Not Sending
1. Verify Twilio credentials are correct
2. Check phone number format (+880XXXXXXXXX)
3. Ensure sufficient Twilio balance
4. Check Twilio dashboard for message status

### General Issues
1. Check server logs: `npm run dev`
2. Verify environment variables are loaded
3. Test with the provided test script

## Future Enhancements

- PDF receipt attachments
- Multiple language support
- Customizable receipt templates
- Receipt delivery status tracking
- Integration with other SMS providers
