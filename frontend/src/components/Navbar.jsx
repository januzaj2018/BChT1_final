import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";

const Navbar = () => {
  const { account, connectWallet, networkName, ethBalance, tokenBalance } =
    useContext(Web3Context);
  const location = useLocation();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                GreenPulse
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center ml-10 space-x-1">
              <NavLink to="/" active={location.pathname === "/"}>
                Overview
              </NavLink>
              <NavLink to="/create" active={location.pathname === "/create"}>
                Launch
              </NavLink>
              <NavLink to="/profile" active={location.pathname === "/profile"}>
                Portfolio
              </NavLink>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {account ? (
              <>
                {/* Network Indicator */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-md border border-slate-700">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      networkName === "Localhost" || networkName === "Sepolia"
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-xs font-medium text-slate-300">
                    {networkName || "Wrong Network"}
                  </span>
                </div>

                {/* Balances */}
                <div className="hidden lg:flex flex-col items-end mr-2">
                  <span className="text-xs font-medium text-slate-400">
                    Balance
                  </span>
                  <div className="flex gap-3 text-sm">
                    <span className="text-white font-medium">
                      {Number(ethBalance).toFixed(4)} ETH
                    </span>
                    <span className="text-emerald-500 font-medium">
                      {Number(tokenBalance).toFixed(0)} LEAF
                    </span>
                  </div>
                </div>

                {/* Account */}
                <div className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 transition-colors px-3 py-1.5 rounded-md border border-slate-700 cursor-default">
                  <div className="w-5 h-5 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-full"></div>
                  <span className="text-sm font-mono text-slate-200">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-white text-slate-900 hover:bg-slate-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
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

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
      active
        ? "text-white bg-slate-800"
        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
