// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LendingPool {
    address public owner;
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public loans;
    uint256 constant INTEREST_RATE = 6;

    // chat
    mapping(uint256 => ChatMessage) public messages;
    uint256 public messageCount;
    struct ChatMessage {
        address sender;
        string text;
        uint256 timestamp;
    }

    event MessageStored(address indexed sender, uint256 indexed messageId);

    constructor() {
        owner = msg.sender;
        messageCount = 0;
    }

    function deposit() external payable {
        deposits[msg.sender] += msg.value;
    }

    function getTotalFunds() public view returns (uint256) {
        return address(this).balance;
    }

    function calculateInterest(uint256 amount) public pure returns (uint256) {
        return (amount * INTEREST_RATE) / 100;
    }

    function borrow(uint256 amount) external {
        require(getTotalFunds() >= amount, "Insufficient funds in pool");
        require(
            loans[msg.sender] + amount > loans[msg.sender],
            "Potential overflow detected"
        );

        loans[msg.sender] += amount;
        payable(msg.sender).transfer(amount);
    }

    function repay() external payable {
        uint256 owedAmount = loans[msg.sender] +
            calculateInterest(loans[msg.sender]);
        require(
            msg.value == owedAmount,
            "Repay the exact loan amount including interest"
        );

        loans[msg.sender] = 0;
    }

    // chat
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    function storeMessage(string memory text) public {
        require(bytes(text).length > 0, "Message text cannot be empty");

        uint256 messageId = messageCount++;
        messages[messageId] = ChatMessage({
            sender: msg.sender,
            text: text,
            timestamp: block.timestamp
        });

        emit MessageStored(msg.sender, messageId);
    }

    function getMessage(
        uint256 messageId
    ) public view returns (address, string memory, uint256) {
        require(messageId < messageCount, "Invalid message ID");

        ChatMessage storage message = messages[messageId];
        return (message.sender, message.text, message.timestamp);
    }

    function getAllMessages() public view returns (ChatMessage[] memory) {
        ChatMessage[] memory allMessages = new ChatMessage[](messageCount);
        for (uint256 i = 0; i < messageCount; i++) {
            ChatMessage storage message = messages[i];
            allMessages[i] = ChatMessage({
                sender: message.sender,
                text: message.text,
                timestamp: message.timestamp
            });
        }
        return allMessages;
    }

    receive() external payable {}
}
