// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LendingPool {
    address public owner;
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public loans;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        deposits[msg.sender] += msg.value;
    }

    function borrow(uint256 amount) external {
        require(deposits[owner] >= amount, "Insufficient funds in pool");
        loans[msg.sender] += amount;
        deposits[owner] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function repay() external payable {
        require(loans[msg.sender] > 0, "No active loan found");
        require(msg.value == loans[msg.sender], "Repay the exact loan amount");
        loans[msg.sender] = 0;
        deposits[owner] += msg.value;
    }
}
