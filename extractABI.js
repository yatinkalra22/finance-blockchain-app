const fs = require("fs");
const path = require("path");

const artifactPath = path.join(
  __dirname,
  "./artifacts/contracts/LendingPool.sol/LendingPool.json"
);
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

fs.writeFileSync(
  "./client/src/LendingPoolABI.json",
  JSON.stringify(artifact.abi, null, 2)
);
