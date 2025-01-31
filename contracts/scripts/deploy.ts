import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import path from "path";

async function main() {
	const [deployer] = await ethers.getSigners();
	console.log("Deploying with:", deployer.address);

	// Deploy ElasticToken
	const ElasticToken = await ethers.getContractFactory("ElasticToken");
	const elasticToken = await ElasticToken.deploy();
	await elasticToken.waitForDeployment();

	const elasticTokenAddress = await elasticToken.getAddress();
	console.log("ElasticToken deployed to:", elasticTokenAddress);

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