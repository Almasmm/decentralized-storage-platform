const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StorageContract", function () {
  let token, storageContract;
  let owner, provider, consumer;
  const initialSupply = ethers.parseEther("100000");

  beforeEach(async function () {
    [owner, provider, consumer] = await ethers.getSigners();

    // Deploy StorageToken contract
    const StorageToken = await ethers.getContractFactory("StorageToken");
    token = await StorageToken.deploy(initialSupply);
    await token.waitForDeployment();

    // Deploy StorageContract with StorageToken address
    const StorageContract = await ethers.getContractFactory("StorageContract");
    storageContract = await StorageContract.deploy(await token.getAddress());
    await storageContract.waitForDeployment();

    // Transfer ownership of StorageToken to StorageContract
    await token.transferOwnership(await storageContract.getAddress());

    // Transfer some tokens to consumer for testing
    await token.transfer(
      await consumer.getAddress(),
      ethers.parseEther("1000")
    );
  });

  it("Should grant initial tokens to a new user", async function () {
    await storageContract
      .connect(owner)
      .grantInitialTokens(await consumer.getAddress());
    const consumerBalance = await token.balanceOf(await consumer.getAddress());
    expect(consumerBalance).to.equal(ethers.parseEther("11000")); // 1000 initial transfer + 10000 grant
  });

  it("Should allow a provider to list storage", async function () {
    await storageContract
      .connect(provider)
      .listStorage(100, ethers.parseEther("1"));
    const listing = await storageContract.listings(1);

    expect(listing.provider).to.equal(await provider.getAddress());
    expect(listing.storageSize).to.equal(100);
    expect(listing.pricePerDay).to.equal(ethers.parseEther("1"));
    expect(listing.available).to.be.true;
  });

  it("Should allow a consumer to create a storage request", async function () {
    await storageContract
      .connect(provider)
      .listStorage(100, ethers.parseEther("1"));
    await token
      .connect(consumer)
      .approve(await storageContract.getAddress(), ethers.parseEther("10"));

    await storageContract.connect(consumer).createRequest(1, 5); // 5 days

    const request = await storageContract.requests(1, 1);
    expect(request.consumer).to.equal(await consumer.getAddress());
    expect(request.duration).to.equal(5);
    expect(request.accepted).to.be.false;
    expect(request.completed).to.be.false;
  });

  it("Should allow a provider to accept a request", async function () {
    await storageContract
      .connect(provider)
      .listStorage(100, ethers.parseEther("1"));
    await token
      .connect(consumer)
      .approve(await storageContract.getAddress(), ethers.parseEther("5"));
    await storageContract.connect(consumer).createRequest(1, 5);

    await storageContract.connect(provider).acceptRequest(1, 1);
    const request = await storageContract.requests(1, 1);

    expect(request.accepted).to.be.true;
    expect(request.startTime).to.be.greaterThan(0);
    expect((await storageContract.listings(1)).available).to.be.false;
  });

  it("Should allow a consumer to complete a request after duration", async function () {
    await storageContract
      .connect(provider)
      .listStorage(100, ethers.parseEther("1"));
    await token
      .connect(consumer)
      .approve(await storageContract.getAddress(), ethers.parseEther("5"));
    await storageContract.connect(consumer).createRequest(1, 5);

    await storageContract.connect(provider).acceptRequest(1, 1);

    // Simulate passing time for request duration
    await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await storageContract.connect(consumer).completeRequest(1, 1);
    const updatedRequest = await storageContract.requests(1, 1);

    expect(updatedRequest.completed).to.be.true;
    const providerBalance = await token.balanceOf(await provider.getAddress());
    expect(providerBalance).to.equal(ethers.parseEther("5"));
  });
});
