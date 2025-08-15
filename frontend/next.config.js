// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Enable static exports if needed
    // output: 'export',
    
    // Custom webpack configuration for audio support
    webpack: (config) => {
      config.module.rules.push({
        test: /\.(mp3|wav|ogg)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/audio/',
            outputPath: 'static/audio/',
            name: '[name].[ext]',
          },
        },
      });
      
      return config;
    },
    
    // Headers for security
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(self), geolocation=()',
            },
          ],
        },
      ];
    },
  };
  
  module.exports = nextConfig;