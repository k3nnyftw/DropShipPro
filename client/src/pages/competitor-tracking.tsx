import React from "react";
import { CompetitorTracking } from "@/components/supplier-analysis/competitor-tracking";

const CompetitorTrackingPage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display">Competitor Price Tracking</h1>
        <p className="text-gray-600">Monitor and automatically respond to competitor price changes</p>
      </div>

      <CompetitorTracking />
    </>
  );
};

export default CompetitorTrackingPage;