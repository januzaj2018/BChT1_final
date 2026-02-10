const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Full Campaign Lifecycle", function () {
  let CampaignFactory, factory;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    factory = await CampaignFactory.deploy();
    await factory.waitForDeployment();
  });

  async function createTestCampaign(goalEth, days) {
    const goal = ethers.parseEther(goalEth.toString());
    const duration = days * 24 * 60 * 60;
    await factory.createCampaign(goal, duration, "Test", "Desc");
    const campaigns = await factory.getDeployedCampaigns();
    return await ethers.getContractAt(
      "Campaign",
      campaigns[campaigns.length - 1],
    );
  }

  describe("Rewards", function () {
    it("Should mint LEAF tokens to contributors", async function () {
      const campaign = await createTestCampaign(10, 30);
      const contribution = ethers.parseEther("1");

      await campaign.connect(addr1).contribute({ value: contribution });

      const tokenAddress = await factory.token();
      const token = await ethers.getContractAt("GreenToken", tokenAddress);

      // Reward is 100 x contribution
      const expectedReward = contribution * 100n;
      expect(await token.balanceOf(addr1.address)).to.equal(expectedReward);
    });
  });

  describe("Withdrawals", function () {
    it("Should allow creator to withdraw if goal is reached", async function () {
      const campaign = await createTestCampaign(1, 30);
      await campaign
        .connect(addr1)
        .contribute({ value: ethers.parseEther("1") });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      const tx = await campaign.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance + gasUsed).to.be.closeTo(
        initialBalance + ethers.parseEther("1"),
        1000000000000n,
      );
    });

    it("Should fail if goal not reached", async function () {
      const campaign = await createTestCampaign(10, 30);
      await campaign
        .connect(addr1)
        .contribute({ value: ethers.parseEther("1") });
      await expect(campaign.connect(owner).withdraw()).to.be.revertedWith(
        "Goal not reached",
      );
    });
  });

  describe("Refunds", function () {
    it("Should allow refunds if goal not reached after deadline", async function () {
      const campaign = await createTestCampaign(10, 1);
      await campaign
        .connect(addr1)
        .contribute({ value: ethers.parseEther("2") });

      // Increase time
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine");

      const initialBalance = await ethers.provider.getBalance(addr1.address);
      const tx = await campaign.connect(addr1).refund();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(addr1.address);
      expect(finalBalance + gasUsed).to.equal(
        initialBalance + ethers.parseEther("2"),
      );
    });
  });

  describe("Security/Edge Cases", function () {
    it("Should not allow contribution after deadline", async function () {
      const campaign = await createTestCampaign(10, 1);
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine");

      await expect(
        campaign.connect(addr1).contribute({ value: ethers.parseEther("1") }),
      ).to.be.revertedWith("Campaign has ended");
    });

    it("Should not allow non-creator to end campaign", async function () {
      const campaign = await createTestCampaign(10, 30);
      await expect(campaign.connect(addr1).endCampaign()).to.be.revertedWith(
        "Only creator can end",
      );
    });
  });
});
