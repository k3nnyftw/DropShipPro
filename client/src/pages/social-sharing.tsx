import React from "react";
import SocialShare from "@/components/marketing/social-media/social-share";

const SocialSharingPage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display">Social Media Automation</h1>
        <p className="text-gray-600">Share products across multiple platforms with one click and schedule posts for optimal times</p>
      </div>

      <SocialShare />
    </>
  );
};

export default SocialSharingPage;