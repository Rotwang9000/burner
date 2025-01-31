import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import path from "path";

async function main() {
	const [deployer] = await ethers.getSigners();
	console.log("Deploying with:", deployer.address);

	const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");

	const btcPriceFeed = await MockPriceFeed.deploy(30000n * 10n ** 8n); // $30,000
	const ethPriceFeed = await MockPriceFeed.deploy(2000n * 10n ** 8n);  // $2,000

	await btcPriceFeed.waitForDeployment();
	await ethPriceFeed.waitForDeployment();

	const btcAddress = await btcPriceFeed.getAddress();
	const ethAddress = await ethPriceFeed.getAddress();

	console.log("BTC Price Feed:", btcAddress);
	console.log("ETH Price Feed:", ethAddress);

	// Deploy ElasticToken
	const ElasticToken = await ethers.getContractFactory("ElasticToken");
	const elasticToken = await ElasticToken.deploy();
	await elasticToken.waitForDeployment();

	const elasticTokenAddress = await elasticToken.getAddress();
	console.log("ElasticToken deployed to:", elasticTokenAddress);

	// Add price feeds
	await elasticToken.addSymbol( ethAddress);
	console.log("ETH price feed added to ElasticToken");
	await elasticToken.addSymbol( btcAddress);
	console.log("BTC price feed added to ElasticToken");

	// Save address to frontend constants
	const frontendDir = path.join(__dirname, "../../site/src/constants");
	const addressesPath = path.join(frontendDir, "addresses.ts");

	const content = `
export const ELASTIC_TOKEN_ADDRESS = "${elasticTokenAddress}";
  `;

	writeFileSync(addressesPath, content);
	console.log("Contract address saved to frontend constants");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});