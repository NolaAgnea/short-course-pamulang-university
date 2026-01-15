// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    // Owner of the contract
    address public owner;

    //saya ingin menyumpan sebuah nilai dalam bentuk uint256
    uint256 private storedValue;
    
    // State tambahan: message
    string public message;

    //Ketika ada update, saya akan track perubahannya
    event ValueUpdated(uint256 newValue);
    event MessageUpdated(string newMessage);
    event OwnerSet(address indexed oldOwner, address indexed newOwner);

    // Modifier: hanya owner yang bisa jalankan function
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // Constructor: set owner saat deploy
    constructor() {
        owner = msg.sender;
        message = "Hello from SimpleStorage!";
        emit OwnerSet(address(0), msg.sender);
    }

    // Simpan nilai ke blockchain (write) - hanya owner
    function setValue(uint256 _value) public onlyOwner {
        storedValue = _value;
        emit ValueUpdated(_value);
    }
    
    // Update message - hanya owner
    function setMessage(string memory _message) public onlyOwner {
        message = _message;
        emit MessageUpdated(_message);
    }

    // Membaca nilai dari blockchain (read) terakhir kali di update
    function getValue() public view returns (uint256) {
        return storedValue;
    }
}