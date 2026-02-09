// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ICampaignFactory {
    function mintReward(address to, uint256 amount) external;
}

contract Campaign is ReentrancyGuard {
    address public creator;
    uint256 public goal;
    uint256 public deadline;
    uint256 public raisedAmount;
    string public title;
    ICampaignFactory public factory;
    
    mapping(address => uint256) public contributions;
    
    event ContributionMade(address indexed contributor, uint256 amount);
    event GoalReached(uint256 totalRaised);
    event FundsWithdrawn(address indexed creator, uint256 amount);

    constructor(
        address _creator,
        uint256 _goal,
        uint256 _duration,
        address _factory,
        string memory _title
    ) {
        creator = _creator;
        goal = _goal;
        deadline = block.timestamp + _duration;
        factory = ICampaignFactory(_factory);
        title = _title;
    }

    function contribute() external payable nonReentrant {
        require(block.timestamp < deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");

        contributions[msg.sender] += msg.value;
        raisedAmount += msg.value;

        // Reward 100 tokens per 1 ETH
        uint256 rewardAmount = msg.value * 100; 
        
        try factory.mintReward(msg.sender, rewardAmount) {
            // Success
        } catch {
            // Minter role might not be set yet or other error
            // We don't want to revert the donation if token reward fails
        }

        emit ContributionMade(msg.sender, msg.value);
        
        if (raisedAmount >= goal) {
            emit GoalReached(raisedAmount);
        }
    }

    function withdraw() external nonReentrant {
        require(msg.sender == creator, "Only creator can withdraw");
        require(raisedAmount >= goal, "Goal not reached");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(creator).call{value: balance}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(creator, balance);
    }

    function getSummary() external view returns (
        address, uint256, uint256, uint256, uint256, string memory
    ) {
        return (
            creator,
            goal,
            raisedAmount,
            deadline,
            address(this).balance,
            title
        );
    }

    function refund() external nonReentrant {
         require(block.timestamp > deadline, "Campaign not ended");
         require(raisedAmount < goal, "Goal was reached, no refunds");
         
         uint256 contributed = contributions[msg.sender];
         require(contributed > 0, "No contribution found");
         
         contributions[msg.sender] = 0;
         (bool success, ) = payable(msg.sender).call{value: contributed}("");
         require(success, "Refund failed");
    }
}
