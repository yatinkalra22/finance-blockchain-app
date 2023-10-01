async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  const ContractFactory = await ethers.getContractFactory("LendingPool");

  console.log("Starting deployment...");

  const contract = await ContractFactory.deploy();

  // Explicitly wait for the contract to be mined
  console.log("Waiting for contract to be deployed...");
  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
