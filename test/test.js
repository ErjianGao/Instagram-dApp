const Decentragram = artifacts.require("./Decentragram.sol");

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract("Decentragram", (accounts) => {
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
});
