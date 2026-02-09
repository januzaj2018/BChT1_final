import React, { useContext } from "react";
import { Web3Context } from "../context/Web3Context";

const Profile = () => {
  const { account, ethBalance, tokenBalance, networkName } =
    useContext(Web3Context);

  if (!account) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-gray-500">
            Please connect your MetaMask wallet to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-eco-green p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">My Green Profile</h1>
          <p className="opacity-90 font-mono text-sm bg-black bg-opacity-20 inline-block px-4 py-1 rounded-full">
            {account}
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Network Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                Network
              </p>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    networkName === "Localhost" || networkName === "Sepolia"
                      ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                      : "bg-red-500"
                  }`}
                ></div>
                <p className="text-xl font-bold text-gray-800">
                  {networkName || "Unknown"}
                </p>
              </div>
            </div>

            {/* ETH Balance Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                ETH Balance
              </p>
              <p className="text-2xl font-black text-gray-900 truncate">
                {Number(ethBalance).toFixed(4)}{" "}
                <span className="text-sm text-gray-400">ETH</span>
              </p>
            </div>

            {/* Token Balance Card */}
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 col-span-1 md:col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-eco-dark text-xs font-bold uppercase tracking-wider mb-1">
                    Green Rewards
                  </p>
                  <p className="text-4xl font-black text-eco-green">
                    {Number(tokenBalance).toFixed(2)}
                  </p>
                  <p className="text-sm text-eco-dark font-medium mt-1">
                    LEAF Tokens
                  </p>
                </div>
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <span className="text-3xl">🍃</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Account Activity</h3>
            <p className="text-gray-500 text-sm">
              Your contribution history and impact metrics will appear here.
              Start by contributing to a campaign!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
