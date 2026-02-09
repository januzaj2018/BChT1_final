import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";
import { ethers } from "ethers";

const useTime = () => {
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
};

const CampaignDetails = () => {
  const { address } = useParams();
  const { provider, CampaignArtifact, account } = useContext(Web3Context);
  const [campaignData, setCampaignData] = useState(null);
  const [amount, setAmount] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [endLoading, setEndLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const now = useTime();

  const fetchCampaignData = useCallback(async () => {
    if (!provider || !address) return;
    try {
      const contract = new ethers.Contract(
        address,
        CampaignArtifact.abi,
        provider,
      );
      const summary = await contract.getSummary();
      // Summary order: creator, goal, raised, deadline, balance, title, description
      setCampaignData({
        address,
        creator: summary[0],
        goal: summary[1],
        raisedAmount: summary[2],
        deadline: summary[3],
        balance: summary[4],
        title: summary[5],
        description: summary[6],
      });

      const fetchedComments = await contract.getComments();
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
    setFetching(false);
  }, [provider, address, CampaignArtifact.abi]);

  useEffect(() => {
    if (provider && address) {
      fetchCampaignData();
    }
  }, [fetchCampaignData, provider, address]);

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
      alert("Contribution successful.");
      setAmount("");
      fetchCampaignData();
    } catch (error) {
      console.error("Contribution failed:", error);
      alert("Failed: " + (error.reason || error.message));
    }
    setLoading(false);
  };

  const handleEndCampaign = async () => {
    if (!account) return alert("Connect wallet first");
    setEndLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        address,
        CampaignArtifact.abi,
        signer,
      );
      const tx = await contract.endCampaign();
      await tx.wait();
      alert("Campaign ended successfully.");
      fetchCampaignData();
    } catch (error) {
      console.error("End campaign failed:", error);
      alert("Failed: " + (error.reason || error.message));
    }
    setEndLoading(false);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!account) return alert("Connect wallet first");
    if (!commentText.trim()) return;

    setCommentLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        address,
        CampaignArtifact.abi,
        signer,
      );
      const tx = await contract.addComment(commentText);
      await tx.wait();
      setCommentText("");
      fetchCampaignData();
    } catch (error) {
      console.error("Comment failed:", error);
      alert("Failed: " + (error.reason || error.message));
    }
    setCommentLoading(false);
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64 border border-slate-800 rounded-lg">
        <div className="w-8 h-8 boundary border-2 border-slate-700 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-lg">
        <p className="text-slate-400 font-medium">Campaign not found.</p>
      </div>
    );
  }

  const progress =
    (Number(campaignData.raisedAmount) / Number(campaignData.goal)) * 100;
  const deadlineMs = Number(campaignData.deadline) * 1000;
  const isExpired = now > deadlineMs;
  const timeLeftMs = Math.max(0, deadlineMs - now);

  const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  const isCreator =
    account && account.toLowerCase() === campaignData.creator.toLowerCase();

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 font-sans">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 bg-slate-900 rounded-lg border border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold text-white tracking-tight leading-snug">
              {campaignData.title}
            </h1>
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

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            {campaignData.description || "No description provided."}
          </p>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 mb-6 bg-slate-950 p-3 rounded border border-slate-800">
            <span className="text-slate-400">Project ID:</span>
            <span className="text-slate-300 break-all">
              {campaignData.address}
            </span>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1">
                Raised
              </p>
              <p className="text-xl font-semibold text-white">
                {ethers.formatEther(campaignData.raisedAmount)}{" "}
                <span className="text-sm font-normal text-slate-500">ETH</span>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1">
                Target
              </p>
              <p className="text-xl font-semibold text-slate-300">
                {ethers.formatEther(campaignData.goal)}{" "}
                <span className="text-sm font-normal text-slate-500">ETH</span>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1">
                Timeline
              </p>
              <p className="text-xl font-semibold text-slate-300">
                {days}d{" "}
                <span className="text-sm font-normal text-slate-500">
                  {hours}h
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Creator Actions */}
          {isCreator && !isExpired && (
            <div className="mt-8 pt-6 border-t border-slate-800">
              <button
                onClick={handleEndCampaign}
                disabled={endLoading}
                className="px-4 py-2 bg-red-900/20 border border-red-500/30 text-red-500 rounded-md text-sm font-medium hover:bg-red-900/30 transition-all disabled:opacity-50"
              >
                {endLoading ? "Ending..." : "Close Campaign Manually"}
              </button>
            </div>
          )}
        </div>

        {/* Contribution Panel */}
        <div className="lg:col-span-1 bg-slate-900 rounded-lg border border-slate-800 p-6 shadow-sm h-fit">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 border-b border-slate-800 pb-2">
            Contribute Funds
          </h3>

          <form onSubmit={handleContribute} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-md py-2.5 px-3 text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 shadow-inner"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                  ETH
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Estimated Reward</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {(Number(amount || 0) * 100).toFixed(0)} LEAF
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isExpired}
              className={`w-full py-2.5 rounded-md font-medium text-sm text-white transition-colors border border-transparent shadow-sm ${
                loading || isExpired
                  ? "bg-slate-800 cursor-not-allowed text-slate-500 border-slate-700"
                  : "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700"
              }`}
            >
              {loading
                ? "Processing..."
                : isExpired
                ? "Campaign Closed"
                : "Confirm Contribution"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
              Secured by Ethereum
            </p>
          </div>
        </div>
      </div>

      {/* Discussion Section */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Discussion</h3>

        {/* Comment Form */}
        <form onSubmit={handlePostComment} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask a question or leave a comment..."
                rows="2"
                className="w-full bg-slate-950 border border-slate-700 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={commentLoading || !commentText.trim()}
              className="px-4 py-2 h-fit bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {commentLoading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-slate-500 text-sm italic">
              No comments yet. Be the first to start the conversation.
            </p>
          ) : (
            comments.map((comment, index) => (
              <div key={index} className="flex gap-3 group">
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs text-slate-400 font-mono border border-slate-700">
                  {comment.commenter.slice(2, 4)}
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {comment.commenter.slice(0, 6)}...
                      {comment.commenter.slice(-4)}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {new Date(
                        Number(comment.timestamp) * 1000,
                      ).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
