// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LendingPool {
    address public owner;
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public loans;

    constructor() {
        owner = msg.sender;
    }

    // Allows the owner to deposit funds into the contract
    function deposit() external payable {
        deposits[msg.sender] += msg.value;
    }

    // Returns the total funds available in the pool
    function getTotalFunds() public view returns (uint256) {
        return address(this).balance;
    }

    // Allows a user to borrow funds from the pool
    function borrow(uint256 amount) external {
        // Check if the pool has enough funds
        require(getTotalFunds() >= amount, "Insufficient funds in pool");

        // Check for potential overflow in the loans mapping
        require(
            loans[msg.sender] + amount > loans[msg.sender],
            "Potential overflow detected"
        );

        // Transfer the funds and update the state
        loans[msg.sender] += amount;
        payable(msg.sender).transfer(amount);
    }

    // Allows a user to repay their loan
    function repay() external payable {
        // Check if the user is repaying the correct amount
        require(msg.value == loans[msg.sender], "Repay the exact loan amount");

        // Reset the user's loan amount
        loans[msg.sender] = 0;
    }

    // This is a fallback function to accept any incoming ETH
    receive() external payable {}
}
