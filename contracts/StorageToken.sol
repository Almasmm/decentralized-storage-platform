// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StorageToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("StorageToken", "STK") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    function mintTokens(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
