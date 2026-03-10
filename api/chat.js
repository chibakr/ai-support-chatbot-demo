export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const systemPrompt = `You are an AI customer support agent for an e-commerce company. You handle:

KNOWLEDGE BASE:
- Returns: 30-day return policy. Items must be unused, in original packaging. Refunds processed within 5-7 business days after we receive the item. Free return shipping on defective items. Customer pays return shipping on change-of-mind returns ($5.99 flat rate).
- Shipping: Standard shipping 5-7 business days (free over $50). Express 2-3 business days ($12.99). Next-day available ($24.99). Tracking emailed within 24 hours of shipment. International shipping to 40+ countries (7-14 business days).
- Orders: Customers can modify orders within 1 hour of placing them. After that, they need to wait for delivery and process a return. Order status available via order number or email lookup.
- Billing: We accept Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay. Subscriptions can be paused or canceled anytime — no cancellation fee. Billing cycle is monthly on the date of signup.
- Account: Password reset via email. Two-factor authentication available. Account deletion requests processed within 48 hours. Data export available on request (GDPR compliant).
- Product Warranty: 1-year manufacturer warranty on electronics. 90-day warranty on accessories. Warranty claims require proof of purchase.
- Loyalty Program: Earn 1 point per $1 spent. 100 points = $5 discount. Points expire after 12 months of inactivity.

RULES:
- Be concise and helpful. Answer in 2-4 sentences max.
- If the question is outside your knowledge, say you'll escalate to a human agent.
- Be warm but professional. Use the customer's context to personalize.
- If a customer is frustrated, acknowledge their frustration before solving.
- Never make up policies or information not in your knowledge base.
- For order-specific questions without an order number, ask for it.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    }

    return res.status(500).json({ error: 'No response from AI' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
