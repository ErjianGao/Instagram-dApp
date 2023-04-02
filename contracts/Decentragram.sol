pragma solidity ^0.8.19;

contract Decentragram {
  uint256 public myNumber;

  function setNumber(uint256 _number) public {
    myNumber = _number;
  }
}