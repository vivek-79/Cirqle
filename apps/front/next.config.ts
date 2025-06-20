import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  reactStrictMode:false,
  images:{
    remotePatterns:[
      {
        protocol:'https',
        hostname: 'loremflickr.com'
      },
      {
        protocol:'https',
        hostname: 'cdn.jsdelivr.net'
      },
      {
        protocol:'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol:'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol:'https',
        hostname: 'res.cloudinary.com'
      },

    ]
  }
};

export default nextConfig;
