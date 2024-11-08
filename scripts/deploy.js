const hre = require("hardhat");

async function main() {
  // Deploy StorageToken
  const StorageToken = await hre.ethers.getContractFactory("StorageToken");
  const initialSupply = hre.ethers.parseEther("100000"); // 100,000 tokens
  const token = await StorageToken.deploy(initialSupply);
  await token.waitForDeployment();
  console.log("StorageToken deployed to:", await token.getAddress());

  // Deploy StorageContract with StorageToken address
  const StorageContract = await hre.ethers.getContractFactory(
    "StorageContract"
  );
  const storageContract = await StorageContract.deploy(
    await token.getAddress()
  );
  await storageContract.waitForDeployment();
  console.log(
    "StorageContract deployed to:",
    await storageContract.getAddress()
  );

  // Transfer ownership of StorageToken to StorageContract
  const tx = await token.transferOwnership(await storageContract.getAddress());
  await tx.wait();
  console.log("Ownership of StorageToken transferred to StorageContract.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
