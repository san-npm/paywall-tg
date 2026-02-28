/** @type {import('next').NextConfig} */
const nextConfig = {
  // SSR needed for API routes (bot webhook, payments)
  reactStrictMode: true,
};

export default nextConfig;
