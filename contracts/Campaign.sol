// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ICampaignFactory {
    function mintReward(address to, uint256 amount) external;
}

contract Campaign is ReentrancyGuard {
    // Campaign Data
    address public creator;
    uint256 public goal;
    uint256 public deadline;
    uint256 public raisedAmount;
    string public title;
    string public description; // New: Campaign description
    ICampaignFactory public factory;
    
    mapping(address => uint256) public contributions;

    // Comments System
    struct Comment {
        address commenter;
        string text;
        uint256 timestamp;
    }
    Comment[] public comments;
    
    // Events
    event ContributionMade(address indexed contributor, uint256 amount);
    event GoalReached(uint256 totalRaised);
    event FundsWithdrawn(address indexed creator, uint256 amount);
    event CampaignEnded(uint256 timestamp);
    event CommentAdded(address indexed commenter, string text, uint256 timestamp);

    constructor(
        address _creator,
        uint256 _goal,
        uint256 _duration,
        address _factory,
        string memory _title,
        string memory _description
    ) {
        creator = _creator;
        goal = _goal;
        deadline = block.timestamp + _duration;
        factory = ICampaignFactory(_factory);
        title = _title;
        description = _description;
    }

    function contribute() external payable nonReentrant {
        require(block.timestamp < deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");

        // GAS OPTIMIZATION: Using a mapping for contributions is O(1) gas cost for lookups and updates,
        // which is much cheaper than iterating through an array of contributors.
        contributions[msg.sender] += msg.value;
        raisedAmount += msg.value;

        // Reward 100 tokens per 1 ETH
        uint256 rewardAmount = msg.value * 100; 
        
        try factory.mintReward(msg.sender, rewardAmount) {
            // Success
        } catch {
            // Token minting failed, but don't revert donation
        }

        emit ContributionMade(msg.sender, msg.value);
        
        // Auto-End if Goal Reached
        if (raisedAmount >= goal) {
            // If strictly equal or greater, we might want to end it.
            // Requirement said "end when it reaches 100%"
            deadline = block.timestamp; 
            emit GoalReached(raisedAmount);
            emit CampaignEnded(block.timestamp);
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

    function endCampaign() external {
        require(msg.sender == creator, "Only creator can end");
        require(block.timestamp < deadline, "Campaign already ended");
        deadline = block.timestamp;
        emit CampaignEnded(block.timestamp);
    }

    function addComment(string memory _text) external {
        require(bytes(_text).length > 0, "Comment cannot be empty");
        comments.push(Comment(msg.sender, _text, block.timestamp));
        emit CommentAdded(msg.sender, _text, block.timestamp);
    }

    function getComments() external view returns (Comment[] memory) {
        return comments;
    }

    // GAS OPTIMIZATION: This function is 'external view'.
    // It reads state variables but does not modify them, so it costs 0 gas when called externally (e.g. from the frontend).
    // It returns multiple values in a single call to reduce the number of RPC requests required by the client.
    function getSummary() external view returns (
        address, uint256, uint256, uint256, uint256, string memory, string memory
    ) {
        return (
            creator,
            goal,
            raisedAmount,
            deadline,
            address(this).balance,
            title,
            description
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
