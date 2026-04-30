/**
 * Copyright (c) Dušan Mitrović
 *
 * All Rights Reserved.
 *
 * @fileoverview Cloudflare worker to securely proxy Discord webhooks.
 * This file is manually deployed to Cloudflare Dashboard.
 *
 * Required Environment Variables in Cloudflare:
 * - DISCORD_WEBHOOK_URL: The secret URL provided by Discord.
 *
 * @author Dušan Mitrović
 */

export default {
  async fetch(request, env) {
    if (request.method !== 'POST' && request.method !== 'OPTIONS') {
      return new Response('Method not Allowed', { 'status': 405 });
    }

    const origin = request.headers.get('Origin');
    const allowedOrigins = [
      'https://mainframeforge.com',
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500'
    ];

    if (!allowedOrigins.includes(origin)) {
      return new Response('Forbidden', { 'status': 403 });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { 'headers': corsHeaders });
    }

    try {
      const body = await request.json().catch(() => ({}));
      const pageName = body.page || 'Unknown Page';

      const country = request.headers.get('cf-ipcountry') || 'Unknown Region';

      const discordPayload = {
        'content': `New visitor detected!\nPage: \`${pageName}\`\nRegion: \`${country}\``
      };

      const discordRes = await fetch(env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });

      if (!discordRes.ok) {
        throw new Error('Discord rejected the payload.');
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
}

