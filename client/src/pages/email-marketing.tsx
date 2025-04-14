import React from "react";
import EmailAutomation from "@/components/marketing/email-automation";

const EmailMarketingPage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display">Email Marketing Automation</h1>
        <p className="text-gray-600">Create, schedule, and analyze automated email campaigns to drive sales and engagement</p>
      </div>

      <EmailAutomation />
    </>
  );
};

export default EmailMarketingPage;