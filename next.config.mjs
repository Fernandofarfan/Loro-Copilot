/** @type {import('next').NextConfig} */

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://us-assets.i.posthog.com https://us.i.posthog.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  connect-src 'self' https://api.deepgram.com wss://api.deepgram.com https://generativelanguage.googleapis.com https://api.openai.com https://api.anthropic.com https://openrouter.ai https://api.opencode.ai https://cdn.jsdelivr.net https://us.i.posthog.com https://us-assets.i.posthog.com https://docs.google.com;
  worker-src 'self' blob: https://cdn.jsdelivr.net;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Permissions-Policy",
            value: "microphone=(self), display-capture=(self), camera=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
