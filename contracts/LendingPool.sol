// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LendingPool {
    address public owner;
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public loans;

    uint256 constant INTEREST_RATE = 6;

    constructor() {
        owner = msg.sender;
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

    receive() external payable {}
}
