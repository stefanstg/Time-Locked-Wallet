// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccountInfo {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function getBalanceOf(address _sender) public view returns(uint){
        return address(_sender).balance;
    }
}