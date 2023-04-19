// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Address.sol";

contract Decentragram {
  // // Test
  // uint256 public myNumber;

  // function setNumber(uint256 _number) public {
  //   myNumber = _number;
  // }
  mapping(uint => Image) public images;
  uint public imageCount = 0;
  
  struct Image {
    uint id;
    string hashCode;
    string description;
    uint tipAmount;
    address payable author;
  }

  event ImageCreated(
    uint id,
    string hashCode,
    string description,
    uint tipAmount,
    address payable author
  );

  event ImageTipped(
    uint id,
    string hashCode,
    string description,
    uint tipAmount,
    address payable author
  );

  // create post
  function uploadPost(string memory _hashCode, string memory _description) public {
    require(bytes(_hashCode).length > 0);
    require(bytes(_description).length > 0);
    require(msg.sender != address(0x0));

    address payable _payableSender = payable(msg.sender);

    imageCount++;
    images[imageCount] = Image(imageCount, _hashCode, _description, 0, _payableSender);
    emit ImageCreated(imageCount, _hashCode, _description, 0, _payableSender);
  }
  
  function tipPost(uint _id) public payable {
    require(msg.sender != address(0x0));
    require(_id >= 0 && _id <= imageCount);
    require(msg.value > 0);

    Image memory _image = images[_id];
    address payable _author = _image.author;
    payable(_author).transfer(msg.value);
    _image.tipAmount += msg.value;
    // update the image list
    images[_id] = _image;
    emit ImageTipped(_id, _image.hashCode, _image.description, _image.tipAmount, _image.author);
  }
}