// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Campaign.sol";
import "./GreenToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CampaignFactory is Ownable {
    Campaign[] public campaigns;
    GreenToken public token;
    mapping(address => bool) public isCampaign;

    event CampaignCreated(address indexed campaignAddress, address indexed creator, uint256 goal, string title);

    constructor() {
        token = new GreenToken();
    }

    function createCampaign(uint256 _goal, uint256 _duration, string memory _title) external {
        Campaign newCampaign = new Campaign(msg.sender, _goal, _duration, address(this), _title);
        campaigns.push(newCampaign);
        isCampaign[address(newCampaign)] = true;
        emit CampaignCreated(address(newCampaign), msg.sender, _goal, _title);
    }

    function mintReward(address to, uint256 amount) external {
        require(isCampaign[msg.sender], "Only registered campaigns can mint");
        token.mint(to, amount);
    }

    function getDeployedCampaigns() external view returns (Campaign[] memory) {
        return campaigns;
    }
    
    // Helper to get token address for frontend
    function getTokenAddress() external view returns (address) {
        return address(token);
    }
}
