import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";
import { ethers } from "ethers";

const CampaignDetails = () => {
  const { address } = useParams();
  const { provider, CampaignArtifact, account } = useContext(Web3Context);
  const [campaignData, setCampaignData] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchCampaignData = useCallback(async () => {
    if (!provider || !address) return;
    try {
      const contract = new ethers.Contract(
        address,
        CampaignArtifact.abi,
        provider,
      );
      const summary = await contract.getSummary();
      setCampaignData({
        address: address,
        creator: summary[0],
        goal: summary[1],
        raisedAmount: summary[2],
        deadline: summary[3],
        balance: summary[4],
        title: summary[5],
      });
    } catch (error) {
      console.error("Error fetching project:", error);
    }
    setFetching(false);
  }, [provider, address, CampaignArtifact.abi]);

  useEffect(() => {
    fetchCampaignData();
  }, [fetchCampaignData]);

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!account) return alert("Connect wallet first");
    if (!amount || isNaN(amount)) return alert("Enter valid ETH amount");

    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        address,
        CampaignArtifact.abi,
        signer,
      );
      const tx = await contract.contribute({
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      alert("Contribution successful! LEAF tokens minted to your wallet.");
      setAmount("");
      fetchCampaignData();
    } catch (error) {
      console.error("Contribution failed:", error);
      alert("Transaction failed: " + (error.reason || error.message));
    }
    setLoading(false);
  };

  if (fetching)
    return (
      <div className="text-center py-20 text-gray-500">
        Loading project details...
      </div>
    );
  if (!campaignData)
    return (
      <div className="text-center py-20 text-red-500">Project not found.</div>
    );

  const progress =
    (Number(campaignData.raisedAmount) / Number(campaignData.goal)) * 100;
  const timeLeft = Math.max(0, Number(campaignData.deadline) - currentTime);
  const daysLeft = Math.floor(timeLeft / (24 * 3600));

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                {campaignData.title}
              </h1>
              <p className="text-gray-400 font-mono text-xs truncate max-w-xs">
                {campaignData.address}
              </p>
            </div>
            <div className="bg-eco-light text-eco-dark px-6 py-2 rounded-2xl font-bold">
              {timeLeft > 0
                ? daysLeft > 0
                  ? `${daysLeft} days left`
                  : "Ends today!"
                : "Active"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 p-6 rounded-2xl text-center">
              <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-bold">
                Raised
              </p>
              <p className="text-3xl font-black text-eco-green">
                {ethers.formatEther(campaignData.raisedAmount)} ETH
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Target: {ethers.formatEther(campaignData.goal)} ETH
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl text-center">
              <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-bold">
                Progress
              </p>
              <p className="text-3xl font-black text-gray-800">
                {progress.toFixed(1)}%
              </p>
              <div className="w-full bg-gray-200 h-2 mt-4 rounded-full overflow-hidden">
                <div
                  className="bg-eco-green h-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl text-center">
              <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-bold">
                Creator
              </p>
              <p className="text-xs font-mono text-gray-600 break-all">
                {campaignData.creator}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row border-t border-gray-100 pt-12 gap-12">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About this project
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                This initiative aims to improve our local environment through
                community-driven action. By contributing to this project, you
                are helping fund sustainable development in our neighborhood.
              </p>
              <div className="bg-blue-50 p-6 rounded-2xl">
                <h3 className="text-blue-800 font-bold mb-2">Leaf Reward</h3>
                <p className="text-blue-600 text-sm">
                  You will receive 100 LEAF tokens for every 1 ETH contributed
                  as a token of our gratitude for your "Green Impact".
                </p>
              </div>
            </div>

            <div className="w-full md:w-80">
              <div className="bg-gray-900 p-8 rounded-3xl text-white">
                <h3 className="text-xl font-bold mb-6">Support Project</h3>
                <form onSubmit={handleContribute} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-bold mb-2">
                      Contribution (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.1"
                      className="w-full bg-gray-800 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-eco-green"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold transition-all ${
                      loading
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-eco-green hover:bg-white hover:text-eco-dark"
                    }`}
                  >
                    {loading ? "Processing..." : "Contribute Now"}
                  </button>
                </form>
                <p className="text-center text-[10px] text-gray-500 mt-6 uppercase tracking-widest">
                  Secure Blockchain Transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
