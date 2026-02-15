// Cloudflare Worker: OG Bot Redirect for Zabey Sports
// Deploy at: your-domain.com/* route

const BOT_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'WhatsApp',
  'LinkedInBot',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Googlebot',
  'bingbot',
  'Applebot',
  'Pinterest',
  'Embedly',
  'Quora Link Preview',
  'Showyoubot',
  'outbrain',
  'vkShare',
  'W3C_Validator',
  'redditbot',
  'Mediapartners-Google',
];

const OG_FUNCTION_URL = 'https://eplhgdlewtmzagkyooje.supabase.co/functions/v1/og-image';

export default {
  async fetch(request) {
    const ua = request.headers.get('user-agent') || '';
    const url = new URL(request.url);

    // Only intercept /watch/<slug> paths for bots
    const match = url.pathname.match(/^\/watch\/([^\/]+)\/?$/);
    if (!match) {
      return fetch(request);
    }

    const isBot = BOT_USER_AGENTS.some(bot => ua.toLowerCase().includes(bot.toLowerCase()));
    if (!isBot) {
      return fetch(request);
    }

    // Bot detected on a watch page — serve dynamic OG HTML
    const slug = match[1];
    try {
      const ogResponse = await fetch(`${OG_FUNCTION_URL}?slug=${encodeURIComponent(slug)}&format=html`);
      if (ogResponse.ok) {
        const html = await ogResponse.text();
        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    } catch (e) {
      // Fall through to origin on error
    }

    return fetch(request);
  },
};
