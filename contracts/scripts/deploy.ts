import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import path from "path";

// Arbitrum Sepolia Chainlink Price Feed addresses
const PRICE_FEEDS = {
	BTC: "0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69",  // BTC/USD
};

async function main() {
    const deployer = (await ethers.getSigners())[0];
    console.log("Deploying with:", await deployer.getAddress());
    
    // Deploy ElasticToken
    const ElasticToken = await ethers.getContractFactory("ElasticToken");
    const elasticToken = await ElasticToken.deploy();
    await elasticToken.waitForDeployment();

    const elasticTokenAddress = await elasticToken.getAddress();
    console.log("ElasticToken deployed to:", elasticTokenAddress);

    // Add price feeds with debug logging
    try {
        console.log("Adding BTC price feed...");
        const tx1 = await elasticToken.addSymbol(PRICE_FEEDS.BTC);
        await tx1.wait();
        console.log("BTC price feed added successfully");
    } catch (error) {
        console.error("Error adding BTC feed:", error instanceof Error ? error.message : String(error));
    }

    // Deploy regular and inverse pairs
    await elasticToken.addSymbol(PRICE_FEEDS.BTC, false); // Regular BTC
    await elasticToken.addSymbol(PRICE_FEEDS.BTC, true);  // Inverse BTC (iBTC)
    // ...add other pairs...

    // Save address to frontend constants
    const frontendDir = path.join(__dirname, "../../site/src/constants");
    const addressesPath = path.join(frontendDir, "addresses.ts");

    const content = `
export const ELASTIC_TOKEN_ADDRESS = "${elasticTokenAddress}";
export const CHAINLINK_FEEDS = {
    BTC: "${PRICE_FEEDS.BTC}",
};
`;

    writeFileSync(addressesPath, content);
    console.log("Contract address and price feeds saved to frontend constants");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });