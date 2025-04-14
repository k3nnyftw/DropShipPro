import React from "react";
import { ProductDescriptionGenerator } from "@/components/product-discovery/product-description-generator";

const ProductDescriptionGeneratorPage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display">AI Product Description Generator</h1>
        <p className="text-gray-600">Create compelling product descriptions automatically optimized for conversion and SEO</p>
      </div>

      <ProductDescriptionGenerator />
    </>
  );
};

export default ProductDescriptionGeneratorPage;