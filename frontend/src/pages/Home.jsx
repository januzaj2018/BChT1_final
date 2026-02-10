import React, { useState, useEffect, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import CampaignCard from "../components/CampaignCard";

// Safe time hook
const useNow = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000); // Update every second
    return () => clearInterval(timer);
  }, []);
  return now;
};

const Home = () => {
  const { factoryContract, provider, CampaignArtifact } =
    useContext(Web3Context);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const now = useNow();

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!factoryContract || !provider) return;
      setLoading(true);
      try {
        const addresses = await factoryContract.getDeployedCampaigns();
        const campaignsData = await Promise.all(
          addresses.map(async (addr) => {
            const campaign = new ethers.Contract(
              addr,
              CampaignArtifact.abi,
              provider,
            );
            const summary = await campaign.getSummary();
            return {
              address: addr,
              creator: summary[0],
              goal: summary[1],
              raisedAmount: summary[2],
              deadline: summary[3],
              balance: summary[4],
              title: summary[5],
            };
          }),
        );
        setCampaigns(campaignsData);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
      setLoading(false);
    };

    fetchCampaigns();
  }, [factoryContract, provider, CampaignArtifact]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const isExpired = now / 1000 > Number(campaign.deadline);
    if (filter === "active") return !isExpired;
    if (filter === "ended") return isExpired;
    return true;
  });

  const totalRaised = campaigns.reduce(
    (sum, c) => sum + Number(ethers.formatEther(c.raisedAmount)),
    0,
  );
  const activeCount = campaigns.filter(
    (c) => now / 1000 <= Number(c.deadline),
  ).length;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Fetching Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Campaign Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor and support active crowdfunding initiatives.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              Active
            </p>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              Raised
            </p>
            <p className="text-2xl font-bold text-emerald-400">
              {totalRaised.toFixed(2)} ETH
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 p-1 bg-slate-800 rounded-lg border border-slate-700">
          {["all", "active", "ended"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:block">
          Showing {filteredCampaigns.length} results
        </span>
      </div>

      {/* Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-24 bg-slate-900 border border-dashed border-slate-800 rounded-xl">
          <p className="text-slate-500 text-lg font-medium">
            No campaigns match your filter.
          </p>
          <button
            onClick={() => setFilter("all")}
            className="mt-4 text-emerald-500 hover:text-emerald-400 text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.address} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
