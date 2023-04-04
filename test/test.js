const { assert } = require("chai");

const Decentragram = artifacts.require("Decentragram");

require("chai").use(require("chai-as-promised")).should();

contract("Decentragram", ([deployer, author, tipper]) => {
  let decentragram;

  before(async () => {
    decentragram = await Decentragram.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = await decentragram.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });
  });

  describe("images", async () => {
    let result, imageCount;
    const hashCode = "abc123";

    before(async () => {
      result = await decentragram.uploadPost(hashCode, "hello world", {
        from: author,
      });
      imageCount = await decentragram.imageCount.call();
    });

    it("Post successfully", async () => {
      assert.equal(imageCount, 1, "Incorrect image count");
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), imageCount.toNumber(), "Incorrect imagecount");
      assert.equal(event.hashCode, hashCode, "Incorrect hashCode");
      assert.equal(event.description, "hello world", "Incorrect description");
      assert.equal(event.tipAmount, "0", "Incorrect tipAmount");
      assert.equal(event.author, author, "Incorrect author");
    });
  });
});
