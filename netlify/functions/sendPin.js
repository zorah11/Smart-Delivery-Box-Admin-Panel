exports.handler = async (event) => {
  const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { orderId, pin, phone } = body;
    if (!orderId || !pin) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
        body: JSON.stringify({ message: 'orderId and pin are required' }),
      };
    }

    const thingspeakKey = process.env.THINGSPEAK_WRITE_KEY;
    if (!thingspeakKey) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
        body: JSON.stringify({ message: 'ThingSpeak key not configured' }),
      };
    }

    // Write to ThingSpeak (GET)
    const tsUrl = `https://api.thingspeak.com/update?api_key=${encodeURIComponent(thingspeakKey)}&field1=${encodeURIComponent(pin)}`;
    const tsRes = await fetch(tsUrl, { method: 'GET' });
    const tsText = await tsRes.text().catch(() => '<no body>');
    if (!tsRes.ok || tsText.trim() === '0') {
      return {
        statusCode: 502,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
        body: JSON.stringify({ message: 'ThingSpeak update failed', details: tsText }),
      };
    }

    // Send SMS via BulkSMS
    let sms = null;
    const bulksmsKey = process.env.BULKSMS_API_KEY;
    if (phone && bulksmsKey) {
      try {
        const smsRes = await fetch('https://app.bulksmsug.com/api/v1/send-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bulksmsKey}`,
            Accept: '*/*',
          },
          body: JSON.stringify({ number: phone, message: `Your delivery PIN is ${pin}` }),
        });
        const smsJson = await smsRes.json().catch(() => null);
        sms = { ok: smsRes.ok, status: smsRes.status, body: smsJson };
      } catch (e) {
        sms = { ok: false, error: String(e) };
      }
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, thingspeakEntry: tsText.trim(), sms }),
    };
  } catch (err) {
    console.error('sendPin error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN },
      body: JSON.stringify({ message: err?.message || 'Server error' }),
    };
  }
};
