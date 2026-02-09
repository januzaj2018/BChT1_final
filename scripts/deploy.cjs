const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Factory
  const CampaignFactory = await hre.ethers.getContractFactory(
    "CampaignFactory",
  );
  const factory = await CampaignFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("CampaignFactory deployed to:", factoryAddress);

  // Create a sample campaign
  const tx = await factory.createCampaign(
    hre.ethers.parseEther("1.0"), // Goal: 1 ETH
    30 * 24 * 60 * 60, // Duration: 30 days
    "Save the Amazon Rainforest", // Title
    "This campaign aims to plant 10,000 trees in the Amazon rainforest to combat deforestation and climate change. Every contribution counts!", // Description
  );
  await tx.wait();
  console.log("Sample campaign created");

  // Get deployed campaigns
  const campaigns = await factory.getDeployedCampaigns();
  console.log("Deployed Campaigns:", campaigns);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
