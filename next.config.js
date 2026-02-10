/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Cloudflare Pages with @cloudflare/next-on-pages
  // If you prefer static export instead, uncomment the line below:
  // output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
