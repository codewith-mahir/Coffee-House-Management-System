import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_example',
  templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_example',
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'your_public_key'
};

console.log('EmailJS Config:', {
  serviceId: EMAILJS_CONFIG.serviceId,
  templateId: EMAILJS_CONFIG.templateId,
  hasPublicKey: !!EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.publicKey !== 'your_public_key'
});

// Initialize EmailJS
if (EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.publicKey !== 'your_public_key') {
  emailjs.init(EMAILJS_CONFIG.publicKey);
  console.log('EmailJS initialized successfully');
} else {
  console.error('EmailJS public key not configured properly');
}

// Send order confirmation email
export const sendOrderConfirmation = async (orderData, userEmail) => {
  try {
    console.log('Attempting to send email to:', userEmail);
    console.log('Order data:', orderData);

    // Check if EmailJS is properly configured
    if (!EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey === 'your_public_key') {
      throw new Error('EmailJS not configured. Please set your EmailJS credentials in .env file.');
    }

    if (!userEmail) {
      throw new Error('User email is required');
    }

    console.log('User email validation:', {
      userEmail,
      type: typeof userEmail,
      length: userEmail?.length,
      trimmed: userEmail?.trim()
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      throw new Error(`Invalid email format: ${userEmail}`);
    }

    // Validate order data
    if (!orderData) {
      throw new Error('Order data is required');
    }

    if (!orderData._id) {
      throw new Error('Order ID is missing');
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Order items are missing or empty');
    }

    if (typeof orderData.total === 'undefined' || orderData.total === null) {
      throw new Error('Order total is missing');
    }

    const templateParams = {
      email: userEmail, // This must match the EmailJS template's "To Email" field
      order_id: orderData._id,
      customer_name: orderData.customerName || 'Customer',
      order_total: `৳${orderData.total}`,
      delivery_type: orderData.deliveryType || 'Pickup',
      delivery_address: orderData.deliveryType === 'Home Delivery' ? orderData.address : 'N/A',
      delivery_phone: orderData.deliveryType === 'Home Delivery' ? orderData.phone : 'N/A',
      delivery_notes: orderData.deliveryNote || 'None',
      estimated_time: orderData.deliveryType === 'Home Delivery' ? '30-45 minutes' : '15-20 minutes',
      order_items: orderData.items.map(item => {
        const customization = item.customization || {};
        const size = customization.size ? `(${customization.size})` : '';
        const extras = customization.extras?.length ? ` + ${customization.extras.join(', ')}` : '';
        const instructions = customization.instructions ? ` [Note: ${customization.instructions}]` : '';
        const itemTotal = item.price * item.quantity;
        return `${item.name} ${size}${extras} x${item.quantity} - ৳${itemTotal}${instructions}`;
      }).join('\n'),
      order_date: new Date(orderData.createdAt || Date.now()).toLocaleString(),
      order_summary: `${orderData.items.length} item(s), ${orderData.items.reduce((sum, item) => sum + item.quantity, 0)} total qty`,
      total_items: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
    };

    console.log('Email template parameters:', templateParams);

    // Try sending with EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Email sending failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      text: error.text,
      name: error.name
    });
    
    let errorMessage = 'Unknown error occurred';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.text) {
      errorMessage = error.text;
    } else if (error.status) {
      errorMessage = `EmailJS error (${error.status})`;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Fallback: Simple browser-based email (opens email client)
export const openEmailClient = (orderData, userEmail) => {
  const subject = `Coffee House Order Confirmation - Order #${orderData._id}`;
  const body = `
Dear ${orderData.customerName || 'Customer'},

Thank you for your order at Coffee House!

Order Details:
- Order ID: ${orderData._id}
- Date: ${new Date(orderData.createdAt).toLocaleDateString()}
- Total: ৳${orderData.total}
- Delivery: ${orderData.deliveryType || 'Pickup'}

Items:
${orderData.items.map(item => 
  `• ${item.name} (${item.customization?.size || 'medium'}) x${item.quantity} - ৳${item.price * item.quantity}`
).join('\n')}

${orderData.deliveryType === 'Home Delivery' ? `
Delivery Details:
- Address: ${orderData.address || 'N/A'}
- Phone: ${orderData.phone || 'N/A'}
- Notes: ${orderData.deliveryNote || 'None'}
` : `
Pickup Information:
- Location: Coffee House Main Branch
- Address: 123 Coffee Street, Dhaka, Bangladesh
- Ready in: 15-20 minutes
`}

Thank you for choosing Coffee House!

Best regards,
Coffee House Team
  `.trim();

  const mailtoUrl = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
};
