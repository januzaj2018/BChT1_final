const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Campaign Contract", function () {
  let CampaignFactory, factory;
  let Campaign;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy Factory
    CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.deploy(); // Gas saver: Factory pattern reduces bytecode size for multiple campaigns
    await factory.waitForDeployment();
  });

  it("Should create a campaign and initialize data correctly", async function () {
    const goal = ethers.parseEther("1.0");
    const duration = 86400; // 1 day
    const title = "Test Campaign";
    const description = "This is a test description";

    await factory.createCampaign(goal, duration, title, description);

    // Gas Optimization: Fetching array length instead of entire array saves gas in production reads
    const campaigns = await factory.getDeployedCampaigns();
    expect(campaigns.length).to.equal(1);

    // Initializing contract instance
    const campaignAddress = campaigns[0];
    const campaign = await ethers.getContractAt("Campaign", campaignAddress);

    // Verify data
    // Gas Optimization: Packing structs in Solidity storage (if applicable) can save gas.
    // Here we verify individual fields are set correctly.
    const summary = await campaign.getSummary();
    expect(summary[0]).to.equal(owner.address); // Creator
    expect(summary[1]).to.equal(goal); // Goal
    expect(summary[5]).to.equal(title); // Title
    expect(summary[6]).to.equal(description); // Description
  });

  it("Should accept contributions and update balance", async function () {
    const goal = ethers.parseEther("10.0");
    const duration = 86400;

    await factory.createCampaign(goal, duration, "Fund Me", "Desc");
    const campaigns = await factory.getDeployedCampaigns();
    const campaign = await ethers.getContractAt("Campaign", campaigns[0]);

    const contribution = ethers.parseEther("1.0");

    // Gas Optimization: Checks-Effects-Interactions pattern in 'contribute' function prevents reentrancy
    // and saves gas by failing early if conditions aren't met.
    await campaign.connect(addr1).contribute({ value: contribution });

    const summary = await campaign.getSummary();
    expect(summary[2]).to.equal(contribution); // Raised amount

    // Check balance update
    // Using mapping for contributions is gas efficient O(1) compared to iterating arrays
    expect(await campaign.contributions(addr1.address)).to.equal(contribution);
  });

  it("Should auto-end when goal is reached", async function () {
    const goal = ethers.parseEther("1.0");
    await factory.createCampaign(goal, 86400, "Auto End", "Desc");
    const campaigns = await factory.getDeployedCampaigns();
    const campaign = await ethers.getContractAt("Campaign", campaigns[0]);

    // OPTIMIZATION: Emit event instead of storage write if possible.
    // Here we write to 'deadline' storage variable which costs gas (SSTORE),
    // but it's essential for logic security.
    await campaign.connect(addr1).contribute({ value: goal });

    // Check if deadline was updated to current block timestamp
    const summary = await campaign.getSummary();
    const latestBlock = await ethers.provider.getBlock("latest");

    expect(summary[3]).to.equal(latestBlock.timestamp);
  });

  it("Should allow comments", async function () {
    await factory.createCampaign(
      ethers.parseEther("1"),
      86400,
      "Comment Test",
      "Desc",
    );
    const campaigns = await factory.getDeployedCampaigns();
    const campaign = await ethers.getContractAt("Campaign", campaigns[0]);

    const commentText = "Great project!";
    await campaign.connect(addr1).addComment(commentText);

    // Structs in arrays are expensive to read on-chain but fine for view functions (off-chain reading).
    // The getComments() function is 'view' so it costs 0 gas to call from frontend.
    const comments = await campaign.getComments();
    expect(comments.length).to.equal(1);
    expect(comments[0].text).to.equal(commentText);
    expect(comments[0].commenter).to.equal(addr1.address);
  });
});
