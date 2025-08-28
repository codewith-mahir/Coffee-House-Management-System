# Enhanced EmailJS Template with Dynamic Order Details

## Template Variables Available:

### Basic Order Info:
- `{{to_email}}` - Customer email address
- `{{customer_name}}` - Customer's full name
- `{{order_id}}` - Unique order identifier
- `{{order_total}}` - Total amount with currency (৳)
- `{{order_date}}` - Formatted date and time

### Item Details:
- `{{order_items}}` - Complete formatted list including:
  - Item names
  - Size customizations (small/medium/large)
  - Extra add-ons (extra shot, oat milk, etc.)
  - Special instructions per item
  - Quantities and individual totals

### Delivery Information:
- `{{delivery_type}}` - "Pickup" or "Home Delivery"
- `{{delivery_address}}` - Full delivery address
- `{{delivery_phone}}` - Customer phone number
- `{{delivery_notes}}` - Special delivery instructions
- `{{pickup_location}}` - Coffee shop address for pickup orders

### Order Statistics:
- `{{total_items}}` - Total quantity of all items
- `{{order_summary}}` - Summary like "3 different items, 5 total quantity"
- `{{estimated_time}}` - Estimated preparation/delivery time

## Recommended Email Template:

**Subject:** Coffee House Order Confirmation - Order #{{order_id}}

**Body:**
```
Dear {{customer_name}},

Thank you for your order at Coffee House! 🎉

📋 ORDER DETAILS
Order ID: {{order_id}}
Order Date: {{order_date}}
Total Amount: {{order_total}}
Order Summary: {{order_summary}}

☕ ITEMS ORDERED
{{order_items}}

🚚 DELIVERY INFORMATION
Type: {{delivery_type}}
{{#if delivery_type == "Home Delivery"}}
Address: {{delivery_address}}
Phone: {{delivery_phone}}
Notes: {{delivery_notes}}
Estimated Delivery: {{estimated_time}}
{{else}}
Pickup Location: {{pickup_location}}
Estimated Ready Time: {{estimated_time}}
{{/if}}

We're preparing your order with care and will keep you updated on its status.

Thank you for choosing Coffee House! ☕

Best regards,
The Coffee House Team

---
Questions? Reply to this email or call us at +880-1XXXXXXX
```

## Example Output:
```
Dear John Smith,

Thank you for your order at Coffee House! 🎉

📋 ORDER DETAILS
Order ID: 64f2a1b8c9d4e5f6789012ab
Order Date: August 28, 2025 at 02:30 PM
Total Amount: ৳850
Order Summary: 4 different items, 6 total quantity

☕ ITEMS ORDERED
Cappuccino (large) + Extra Shot x2 - ৳350 [Note: Make it extra hot]
Chocolate Croissant (medium) x1 - ৳150
Americano (small) x2 - ৳200
Latte (medium) + Oat Milk x1 - ৳150

🚚 DELIVERY INFORMATION
Type: Home Delivery
Address: 123 Dhanmondi Road, Apt 4B, Dhaka 1205
Phone: +8801712345678
Notes: Ring doorbell twice, leave at door if no answer
Estimated Delivery: 30-45 minutes
```

This template will automatically populate with different order details for every single order, making each email unique and personalized!
