import React, { useContext } from "react";
import { Web3Context } from "../context/Web3Context";

const Profile = () => {
  const { account, ethBalance, tokenBalance, networkName } =
    useContext(Web3Context);

  if (!account) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-10 text-center max-w-sm mx-auto">
          <p className="text-slate-400 font-medium mb-4">
            You are not connected.
          </p>
          <div className="inline-block px-4 py-1.5 border border-slate-700 rounded text-xs font-mono text-slate-500 bg-slate-950">
            Please Connect Wallet
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Portfolio Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your crypto assets and campaign contributions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-xs font-medium text-slate-500 px-3 py-1 bg-slate-900 rounded border border-slate-800 uppercase tracking-wider">
            {networkName || "Unknown Network"}
          </span>
          <div className="bg-slate-900 text-slate-400 font-mono text-xs px-3 py-1.5 rounded border border-slate-800 truncate max-w-[140px] md:max-w-none">
            {account}
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Total ETH Balance"
          value={Number(ethBalance).toFixed(4)}
          unit="ETH"
        />
        <StatCard
          label="LEAF Rewards"
          value={Number(tokenBalance).toFixed(2)}
          unit="LEAF"
          highlight
        />
        <StatCard
          label="Network Status"
          value={
            networkName === "Localhost" || networkName === "Sepolia"
              ? "Connected"
              : "Error"
          }
          unit="Active"
          className={
            networkName === "Localhost" || networkName === "Sepolia"
              ? "text-emerald-500"
              : "text-red-500"
          }
        />
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Reward History
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Total Earned</span>
              <span className="font-mono text-emerald-400">
                {Number(tokenBalance).toFixed(2)} LEAF
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Current Rate</span>
              <span className="font-mono text-slate-300">100 LEAF / ETH</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-800/50">
              <span className="text-slate-500">Contract</span>
              <span className="font-mono text-slate-600 text-xs truncate max-w-[150px]">
                0x...TokenContract
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Recent Activity
          </h3>
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
            <p className="mb-2 italic">No recent transactions found</p>
            <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700">
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, unit, highlight, className }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors shadow-sm">
    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
      {label}
    </p>
    <div className="flex items-baseline gap-2">
      <span
        className={`text-3xl font-bold tracking-tight ${
          highlight ? "text-emerald-400" : "text-white"
        } ${className}`}
      >
        {value}
      </span>
      <span className="text-sm font-medium text-slate-500">{unit}</span>
    </div>
  </div>
);

export default Profile;
