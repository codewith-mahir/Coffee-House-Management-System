# EmailJS Configuration for Order Confirmations

## Setup Instructions

1. **Create EmailJS Account**
   - Go to https://www.emailjs.com/
   - Sign up for a free account
   - Create a new email service (Gmail, Outlook, etc.)

2. **Configure Email Template**
   - Create a new email template in EmailJS dashboard
   - Use these template variables:
     - `{{to_email}}` - Recipient email
     - `{{customer_name}}` - Customer name
     - `{{order_id}}` - Order ID
     - `{{order_total}}` - Order total amount
     - `{{delivery_type}}` - Pickup or Home Delivery
     - `{{order_items}}` - List of ordered items
     - `{{order_date}}` - Order date
     - `{{delivery_address}}` - Delivery address (if applicable)
     - `{{delivery_phone}}` - Delivery phone (if applicable)
     - `{{delivery_notes}}` - Delivery notes

3. **Get Configuration Values**
   - Service ID: From your EmailJS dashboard
   - Template ID: From your created template
   - Public Key: From your EmailJS account settings

4. **Environment Variables**
   Add to `client/.env`:
   ```
   REACT_APP_EMAILJS_SERVICE_ID=your_service_id
   REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
   REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
   ```

## Sample Email Template

```
Subject: Coffee House Order Confirmation - Order #{{order_id}}

Dear {{customer_name}},

Thank you for your order at Coffee House!

Order Details:
- Order ID: {{order_id}}
- Date: {{order_date}}
- Total: {{order_total}}
- Delivery: {{delivery_type}}

Items:
{{order_items}}

{{#if delivery_address}}
Delivery Details:
- Address: {{delivery_address}}
- Phone: {{delivery_phone}}
- Notes: {{delivery_notes}}
{{else}}
Pickup Information:
- Location: Coffee House Main Branch
- Address: 123 Coffee Street, Dhaka, Bangladesh
- Ready in: 15-20 minutes
{{/if}}

Thank you for choosing Coffee House!

Best regards,
Coffee House Team
```

## Benefits

- ✅ No server-side SMTP configuration needed
- ✅ Free tier supports 200 emails/month
- ✅ Reliable delivery through major email providers
- ✅ Easy template management
- ✅ Works immediately without complex setup
