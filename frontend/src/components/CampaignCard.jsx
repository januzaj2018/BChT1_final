import React from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

const CampaignCard = ({ campaign }) => {
  const progress =
    (Number(campaign.raisedAmount) / Number(campaign.goal)) * 100;
  const isExpired = Date.now() / 1000 > Number(campaign.deadline);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3
            className="text-xl font-bold text-gray-900 truncate"
            title={campaign.title}
          >
            {campaign.title || "Untitled Project"}
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isExpired
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {isExpired ? "Ended" : "Active"}
          </span>
        </div>

        <p
          className="text-xs text-gray-400 mb-4 font-mono truncate"
          title={campaign.address}
        >
          {campaign.address}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Raised</span>
            <span className="font-semibold text-gray-900">
              {ethers.formatEther(campaign.raisedAmount)} ETH
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-eco-green h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1 text-gray-400">
            <span>Goal: {ethers.formatEther(campaign.goal)} ETH</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
        </div>

        <Link
          to={`/campaign/${campaign.address}`}
          className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-eco-dark font-medium py-2 rounded-lg border border-gray-200 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard;
