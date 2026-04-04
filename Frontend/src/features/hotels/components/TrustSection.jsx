import React from "react";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedIcon from "@mui/icons-material/Verified";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const TrustSection = () => {
  const items = [
    {
      icon: <SecurityIcon />,
      title: "Secure payments",
      desc: "Encrypted transactions for complete peace of mind.",
    },
    {
      icon: <VerifiedIcon />,
      title: "Verified listings",
      desc: "Each property is inspected for luxury compliance.",
    },
    {
      icon: <SupportAgentIcon />,
      title: "24/7 support",
      desc: "Dedicated concierge available around the clock.",
    },
    {
      icon: <AttachMoneyIcon />,
      title: "Best price guarantee",
      desc: "Unmatched value for the world's finest stays.",
    },
  ];

  return (
    <section className="py-20 bg-[#ffffff]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              
              {/* ICON BOX */}
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#efedf0] text-[#04162e] mb-5">
                {item.icon}
              </div>

              {/* TITLE */}
              <h3 className="text-lg font-serif text-[#04162e] mb-2">
                {item.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;