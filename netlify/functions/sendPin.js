exports.handler = async (event) => {
  const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
  const DEBUG = process.env.DEBUG_FUNCTIONS === '1';

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
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { orderId, pin, phone } = body;
    if (!orderId || !pin) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'orderId and pin are required' }),
      };
    }

    const thingspeakKey = process.env.THINGSPEAK_WRITE_KEY;
    if (DEBUG) {
      console.log('sendPin DEBUG: env present', {
        hasThingSpeakKey: Boolean(thingspeakKey),
        hasBulkSMSKey: Boolean(process.env.BULKSMS_API_KEY),
      });
    }
    if (!thingspeakKey) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'ThingSpeak key not configured' }),
      };
    }

    // Write to ThingSpeak (GET)
    const tsUrl = `https://api.thingspeak.com/update?api_key=${encodeURIComponent(thingspeakKey)}&field1=${encodeURIComponent(pin)}`;
    if (DEBUG) console.log('sendPin DEBUG: calling ThingSpeak', tsUrl);
    const tsRes = await fetch(tsUrl, { method: 'GET' });
    const tsText = await tsRes.text().catch(() => '<no body>');
    const tsEntry = (tsText || '').trim();
    const tsOk = tsRes.ok && tsEntry !== '0';
    if (DEBUG) console.log('sendPin DEBUG: ThingSpeak result', { status: tsRes.status, entry: tsEntry });
    if (!tsOk) {
      return {
        statusCode: 502,
        headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'ThingSpeak update failed',
          details: tsText,
          ts: { ok: false, status: tsRes.status, entry: tsEntry, url: tsUrl },
        }),
      };
    }

    // Send SMS via BulkSMS
    let sms = null;
    const bulksmsKey = process.env.BULKSMS_API_KEY;
    if (phone && bulksmsKey) {
      try {
        // Convert phone to international format if it starts with 0
        let formattedPhone = phone;
        if (phone.startsWith('0')) {
          formattedPhone = '256' + phone.substring(1); // Uganda country code
        }
        if (DEBUG) console.log('sendPin DEBUG: SMS phone format', { original: phone, formatted: formattedPhone });
        
        const smsRes = await fetch('https://app.bulksmsug.com/api/v1/send-sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bulksmsKey}`,
            Accept: '*/*',
          },
          body: JSON.stringify({ number: formattedPhone, message: `Your delivery PIN is ${pin}` }),
        });
        const smsBodyText = await smsRes.text().catch(() => '<no body>');
        let smsJson = null;
        try { smsJson = JSON.parse(smsBodyText); } catch {}
        sms = { ok: smsRes.ok, status: smsRes.status, body: smsJson ?? smsBodyText };
        if (DEBUG) console.log('sendPin DEBUG: BulkSMS result', { status: smsRes.status, ok: smsRes.ok });
      } catch (e) {
        sms = { ok: false, error: String(e) };
        if (DEBUG) console.log('sendPin DEBUG: BulkSMS error', { error: String(e) });
      }
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        ts: { ok: tsOk, status: tsRes.status, entry: tsEntry, url: tsUrl },
        thingspeakEntry: tsEntry,
        sms,
      }),
    };
  } catch (err) {
    console.error('sendPin error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: err?.message || 'Server error' }),
    };
  }
};
