import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";
import { ethers } from "ethers";

const CreateCampaign = () => {
  const { factoryContract, account } = useContext(Web3Context);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
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
      );
      await tx.wait();

      navigate("/");
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign: " + (error.reason || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Start a Green Initiative
      </h2>

      {!account ? (
        <div className="text-center text-red-500">
          Please connect your wallet to create a campaign.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm"
              placeholder="e.g. Community Garden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Funding Goal (ETH)
            </label>
            <input
              type="number"
              step="0.01"
              name="goal"
              required
              value={formData.goal}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (Days)
            </label>
            <input
              type="number"
              name="duration"
              required
              value={formData.duration}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-eco-green focus:border-eco-green sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-eco-green hover:bg-eco-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Launch Campaign"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateCampaign;
