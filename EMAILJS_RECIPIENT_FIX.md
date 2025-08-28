# EmailJS Template Setup - Recipient Email Fix

## The Problem
You're getting "The recipients address is empty" error because the EmailJS template is not properly configured to receive the recipient email address.

## Solution: Update Your EmailJS Template

### Step 1: Go to EmailJS Dashboard
1. Login to [EmailJS.com](https://www.emailjs.com)
2. Go to "Email Templates"
3. Find your template with ID: `template_axmdw0p`
4. Click "Edit"

### Step 2: Configure the Recipient Field
In your template settings, make sure the **"To Email"** field is set to one of these variables:

**Option 1 (Recommended):** `{{to_email}}`
**Option 2:** `{{email}}`
**Option 3:** `{{user_email}}`

### Step 3: Template Settings
Make sure your template has these settings:

**To Email:** `{{to_email}}`
**From Name:** Coffee House
**From Email:** Your configured email service
**Subject:** `Coffee House Order Confirmation - Order #{{order_id}}`

### Step 4: Test Template
1. In the EmailJS template editor, click "Test"
2. Fill in sample values:
   - `to_email`: your-test-email@example.com
   - `customer_name`: Test Customer
   - `order_id`: 123456
   - etc.
3. Click "Send Test"
4. Check if you receive the test email

## Alternative: Manual EmailJS Test

If you want to test the EmailJS integration separately, add this test function to your checkout page:

```javascript
const testEmailJS = async () => {
  try {
    const testParams = {
      to_email: 'your-email@example.com', // Replace with your actual email
      customer_name: 'Test Customer',
      order_id: 'TEST123',
      order_total: '৳500',
      delivery_type: 'Pickup',
      order_items: 'Test Coffee (large) x1 - ৳500',
      order_date: new Date().toLocaleDateString(),
      delivery_address: 'N/A',
      delivery_phone: 'N/A',
      delivery_notes: 'Test order'
    };

    const response = await emailjs.send(
      'service_7mde56k',
      'template_axmdw0p',
      testParams
    );
    console.log('Test email sent:', response);
  } catch (error) {
    console.error('Test email failed:', error);
  }
};
```

## Common Issues & Solutions

### Issue: "The recipients address is empty"
**Solution:** Template "To Email" field is not configured with `{{to_email}}`

### Issue: "Template not found"
**Solution:** Check that `template_axmdw0p` exists and is published

### Issue: "Service not found"
**Solution:** Check that `service_7mde56k` exists and is connected

### Issue: "Public key invalid"
**Solution:** Verify public key `D08kOwyX9Zoag76xP` in EmailJS account settings

## Verification Steps
1. ✅ Template "To Email" set to `{{to_email}}`
2. ✅ Template is published (not in draft)
3. ✅ Service is connected and working
4. ✅ Public key matches your account
5. ✅ Test email sends successfully from EmailJS dashboard

Once you've updated the template settings, try placing another order. The error should be resolved!
