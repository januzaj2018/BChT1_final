const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Verifying deployment with account:", deployer.address);

  // Deploy Factory
  const CampaignFactory = await hre.ethers.getContractFactory(
    "CampaignFactory",
  );
  const campaignFactory = await CampaignFactory.deploy();
  await campaignFactory.waitForDeployment();
  const factoryAddress = await campaignFactory.getAddress();

  console.log("CampaignFactory deployed to:", factoryAddress);

  const tokenAddress = await campaignFactory.token();
  console.log("GreenToken deployed to:", tokenAddress);

  // Try creating a campaign
  console.log("Creating a test campaign...");
  const tx = await campaignFactory.createCampaign(
    hre.ethers.parseEther("10"), // goal 10 ETH
    3600, // duration 1 hour
    "Test Campaign",
  );
  await tx.wait();
  console.log("Campaign created successfully.");

  // Fetch campaigns
  const campaigns = await campaignFactory.getDeployedCampaigns();
  console.log("Deployed campaigns:", campaigns);

  if (campaigns.length > 0) {
    const campaignAddress = campaigns[0];
    console.log("Interacting with campaign at:", campaignAddress);

    // Interact with Campaign
    const Campaign = await hre.ethers.getContractFactory("Campaign");
    const campaign = Campaign.attach(campaignAddress);

    const summary = await campaign.getSummary();
    console.log("Campaign Summary:", summary);
  } else {
    console.error("No campaigns found!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
