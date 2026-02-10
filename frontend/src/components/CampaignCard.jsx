import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

// Self-contained time hook
const useTime = () => {
  const [time, setTime] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
};

const CampaignCard = ({ campaign }) => {
  const now = useTime();
  const progress =
    (Number(campaign.raisedAmount) / Number(campaign.goal)) * 100;

  const deadlineMs = Number(campaign.deadline) * 1000;
  const isExpired = now > deadlineMs;

  const timeLeftMs = Math.max(0, deadlineMs - now);
  const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all group hover:shadow-lg">
      <div className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
              {campaign.title || "Untitled Project"}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              {campaign.address.slice(0, 10)}...{campaign.address.slice(-4)}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium border ${
              isExpired
                ? "bg-slate-800 text-slate-400 border-slate-700"
                : "bg-emerald-900/10 text-emerald-500 border-emerald-900/20"
            }`}
          >
            {isExpired ? "Closed" : "Active"}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Raised</span>
            <span className="text-slate-200 font-medium">
              {ethers.formatEther(campaign.raisedAmount)}{" "}
              <span className="text-slate-500 text-xs">ETH</span>
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress >= 100 ? "bg-emerald-500" : "bg-emerald-600"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span>Goal: {ethers.formatEther(campaign.goal)} ETH</span>
            <span
              className={progress >= 100 ? "text-emerald-500 font-bold" : ""}
            >
              {progress.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {!isExpired ? (
              <span className="font-mono">
                {days}d {hours}h remaining
              </span>
            ) : (
              <span>Ended</span>
            )}
          </div>

          <Link
            to={`/campaign/${campaign.address}`}
            className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 group/link"
          >
            Details{" "}
            <span className="group-hover/link:translate-x-0.5 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
