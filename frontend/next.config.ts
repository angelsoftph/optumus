const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kylletest.s3.ap-southeast-1.amazonaws.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
