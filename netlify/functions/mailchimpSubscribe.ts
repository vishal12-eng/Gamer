import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'ok' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { email } = JSON.parse(event.body || '{}');

    if (!email) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;

    if (!apiKey || !listId) {
      console.error('Missing Mailchimp configuration');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    const apiServer = apiKey.split('-')[1];
    const url = `https://${apiServer}.api.mailchimp.com/3.0/lists/${listId}/members`;

    const subscriberData = {
      email_address: email,
      status: 'subscribed',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.title === 'Member Exists') {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Email already subscribed', success: true }),
        };
      }
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: data.detail || 'Subscription failed' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Successfully subscribed!', success: true }),
    };
  } catch (error) {
    console.error('Mailchimp error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
