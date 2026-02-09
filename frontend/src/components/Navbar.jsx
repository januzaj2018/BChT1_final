import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";

const Navbar = () => {
  const { account, connectWallet, networkName } = useContext(Web3Context);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-eco-green">
              GreenPulse
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-eco-dark px-3 py-2 rounded-md font-medium"
              >
                Campaigns
              </Link>
              <Link
                to="/create"
                className="text-gray-700 hover:text-eco-dark px-3 py-2 rounded-md font-medium"
              >
                Start Campaign
              </Link>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-eco-dark px-3 py-2 rounded-md font-medium"
              >
                My Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {account ? (
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    networkName === "Localhost" || networkName === "Sepolia"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {networkName || "Wrong Network"}
                </span>
                <span className="bg-eco-light text-eco-dark px-4 py-2 rounded-full font-mono text-sm">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-eco-green text-white px-4 py-2 rounded-md font-medium hover:bg-eco-dark transition-colors"
                id="connect-wallet-btn"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
