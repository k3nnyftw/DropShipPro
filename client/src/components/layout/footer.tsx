import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} DropShipify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
