/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enable static exports
  images: {
    unoptimized: true, // Required for static export
  },
  // Since this is a static export, we don't need a basePath
  // but if you deploy to a subfolder, you'll need to set it
  // basePath: '/snappy-cam',
  // Add metadata for PWA
};

module.exports = nextConfig;
