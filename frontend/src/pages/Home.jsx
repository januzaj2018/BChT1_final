import React, { useState, useEffect, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import CampaignCard from "../components/CampaignCard";

const Home = () => {
  const { factoryContract, provider, CampaignArtifact } =
    useContext(Web3Context);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!factoryContract || !provider) return;
      setLoading(true);
      try {
        const addresses = await factoryContract.getDeployedCampaigns();
        console.log("Found campaigns:", addresses);

        const campaignsData = await Promise.all(
          addresses.map(async (addr) => {
            const campaign = new ethers.Contract(
              addr,
              CampaignArtifact.abi,
              provider,
            );
            // Update: getSummary now returns title at index 5
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-green"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Fund Local <span className="text-eco-green">Eco-Projects</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Join your neighbors in funding green initiatives. Earn LEAF tokens for
          every contribution.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No campaigns found. Be the first to start one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.address} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
