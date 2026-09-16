/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@restovyn/types",
    "@restovyn/validation",
    "@restovyn/business-rules",
  ],
};

module.exports = nextConfig;
