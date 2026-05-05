// ================================
// CLOUDFLARE WORKER
// HTTP Proxy → Railway HTTPS
// Deploy di: https://workers.cloudflare.com
// ================================

const RAILWAY_URL = "https://server-sapi-production.up.railway.app";

export default {
  async fetch(request, env, ctx) {
    // Allow CORS & handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);
    const targetURL = RAILWAY_URL + url.pathname + url.search;

    // Forward request ke Railway
    const forwardedRequest = new Request(targetURL, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-From": "cloudflare-worker",
      },
      body: request.method !== "GET" ? request.body : undefined,
    });

    try {
      const response = await fetch(forwardedRequest);
      const body = await response.text();

      return new Response(body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ status: "error", pesan: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};