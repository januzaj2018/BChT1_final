import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";
import { ethers } from "ethers";

const CreateCampaign = () => {
  const { factoryContract, account } = useContext(Web3Context);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal: "",
    duration: "30",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!factoryContract) return alert("Wallet not connected");

    setLoading(true);
    try {
      const goalInWei = ethers.parseEther(formData.goal);
      const durationInSeconds = Number(formData.duration) * 24 * 60 * 60;

      const tx = await factoryContract.createCampaign(
        goalInWei,
        durationInSeconds,
        formData.title,
        formData.description,
      );
      await tx.wait();
      navigate("/");
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed: " + (error.reason || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-800 bg-slate-850">
          <h2 className="text-xl font-semibold text-white">
            Create New Campaign
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure parameters for your new crowdfunding contract.
          </p>
        </div>

        <div className="p-8">
          {!account ? (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">
                You must connect your wallet to deploy contracts.
              </p>
              <div className="inline-block px-4 py-2 bg-slate-800 rounded border border-slate-700 text-sm font-mono text-slate-400">
                Wallet Disconnected
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Campaign Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
                  placeholder="Enter project name..."
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
                  placeholder="Describe your project goals, impact, and timeline..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Goal Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Funding Target
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      name="goal"
                      required
                      value={formData.goal}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 pointer-events-none">
                      ETH
                    </div>
                  </div>
                </div>

                {/* Duration Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Duration
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="duration"
                      required
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 pointer-events-none">
                      Days
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-md p-4 text-sm text-slate-400">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Campaign contract will be deployed to the current network.
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Contributors receive{" "}
                  <strong className="text-emerald-400">100 LEAF</strong> per ETH
                  automatically.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2.5 rounded-md font-medium text-sm text-white transition-all shadow-sm ${
                    loading
                      ? "bg-slate-700 cursor-wait opacity-70"
                      : "bg-emerald-600 hover:bg-emerald-500 border border-transparent"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Deploying...
                    </span>
                  ) : (
                    "Deploy Campaign"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
