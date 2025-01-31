import { expect } from "chai";
import { ethers } from "hardhat";
import { 
    ElasticToken,
    MockPriceFeed 
} from "../typechain-types";
import {
    HardhatEthersSigner
} from "@nomicfoundation/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";

describe("ElasticToken", function () {
    let elasticToken: ElasticToken;
    let btcFeed: MockPriceFeed;
    let ethFeed: MockPriceFeed;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;

    const BTC_INITIAL_PRICE = 30000n;
    const ETH_INITIAL_PRICE = 2000n;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy mock price feeds
        const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed") as ContractFactory;
        btcFeed = (await MockPriceFeed.deploy(BTC_INITIAL_PRICE)) as MockPriceFeed;
        await btcFeed.waitForDeployment();
        ethFeed = (await MockPriceFeed.deploy(ETH_INITIAL_PRICE)) as MockPriceFeed;
        await ethFeed.waitForDeployment();

        // Deploy token
        const ElasticToken = await ethers.getContractFactory("ElasticToken");
        elasticToken = await ElasticToken.deploy() as unknown as ElasticToken;
        await elasticToken.waitForDeployment();

        // Add supported symbols
        await elasticToken.addSymbol("BTC", await btcFeed.getAddress());
        await elasticToken.addSymbol("ETH", await ethFeed.getAddress());
    });

    describe("Symbol Management", function () {
        it("Should add new symbols correctly", async function () {
            const info = await elasticToken.getSymbolInfo("BTC");
            expect(info[0]).to.equal(await btcFeed.getAddress());
            expect(info[3]).to.be.true;  // active status
        });

        it("Should prevent adding duplicate symbols", async function () {
            await expect(
                elasticToken.addSymbol("BTC", await btcFeed.getAddress())
            ).to.be.revertedWith("Symbol already exists");
        });

        it("Should deactivate symbols", async function () {
            await elasticToken.deactivateSymbol("BTC");
            const info = await elasticToken.getSymbolInfo("BTC");
            expect(info[3]).to.be.false;  // active status
        });

        it("Should confirm ETH is added as a symbol", async function () {
            const info = await elasticToken.getSymbolInfo("ETH");
            expect(info[0]).to.equal(await ethFeed.getAddress());
            expect(info[3]).to.be.true;  // active status
        });
    });

    describe("Token Operations", function () {
        it("Should allow buying tokens", async function () {
            const buyAmount = ethers.parseEther("1.0");
            console.log("Attempting to buy tokens...");
            console.log("Contract address:", await elasticToken.getAddress());
            console.log("User1 address:", user1.address);
            console.log("BuyAmount:", buyAmount.toString());
            
            const tx = await elasticToken.connect(user1).buyTokens(
                "BTC",                          // symbol
                ethers.parseEther("0"),         // minTokensOut
                { value: buyAmount }           // ETH value
            );
            
            // Wait for confirmation and get receipt
            const receipt = await tx.wait();
            console.log("Transaction confirmed, hash:", receipt?.hash);

            // Check results
            const balance = await elasticToken.balanceOf(user1.address);
            console.log("Resulting balance:", balance.toString());
            expect(balance).to.be.gt(0n);
        });

        // Fix other tests to use the same pattern
        it("Should apply correct tax on buys", async function () {
            const buyAmount = ethers.parseEther("1.0");
            const taxesBefore = await elasticToken.collectedTaxes();
            
            const tx = await elasticToken.connect(user1).buyTokens(
                "BTC",
                ethers.parseEther("0"),
                { value: buyAmount }
            );
            await tx.wait();

            const taxesAfter = await elasticToken.collectedTaxes();
            const expectedTax = (buyAmount * 500n) / 10000n;
            expect(taxesAfter - taxesBefore).to.equal(expectedTax);
        });

        it("Should allow selling tokens", async function () {
            // First buy some tokens
            await elasticToken.connect(user1).buyTokens("BTC", 0n, {
                value: ethers.parseEther("1.0")
            });
            
            // Mine a block to pass flash loan protection
            await ethers.provider.send("evm_mine", []);

            const balance = await elasticToken.balanceOf(user1.address);
            await elasticToken.connect(user1).sellTokens("BTC", balance);
            expect(await elasticToken.balanceOf(user1.address)).to.equal(0n);
        });
    });

    describe("Long Positions", function () {
        beforeEach(async function () {
            // Add initial liquidity to support positions
            await elasticToken.connect(owner).buyTokens(
                "BTC",
                ethers.parseEther("0.001"),
                { value: ethers.parseEther("10.0") }
            );
        });

        it("Should open long positions", async function () {
            await elasticToken.connect(user1).openLongPosition("BTC", {
                value: ethers.parseEther("1.0")
            });

            const position = await elasticToken.getPositionInfo(user1.address);
            expect(position.ethAmount).to.equal(ethers.parseEther("1.0"));
        });

        it("Should calculate profits correctly", async function () {
            // Open position
            await elasticToken.connect(user1).openLongPosition("BTC", {
                value: ethers.parseEther("1.0")
            });

            // Increase price by 10%
            await ethers.provider.send("evm_increaseTime", [16]);
            await ethers.provider.send("evm_mine", []);
            await btcFeed.setPrice(BTC_INITIAL_PRICE * 110n / 100n);

            const position = await elasticToken.getPositionInfo(user1.address);
            expect(position.currentPnL).to.be.gt(0);
        });

        it("Should close positions and pay profits", async function () {
            // Open position with smaller amount
            await elasticToken.connect(user1).openLongPosition(
                "BTC",
                { value: ethers.parseEther("0.1") }
            );

            // Increase price by 10%
            await ethers.provider.send("evm_increaseTime", [16]);
            await ethers.provider.send("evm_mine", []);
            await btcFeed.setPrice(BTC_INITIAL_PRICE * 110n / 100n);

            const balanceBefore = await ethers.provider.getBalance(user1.address);
            const tx = await elasticToken.connect(user1).closeLongPosition();
            await tx.wait();
            const balanceAfter = await ethers.provider.getBalance(user1.address);

            expect(balanceAfter).to.be.gt(balanceBefore);
        });
    });

    describe("Rebase Mechanism", function () {
        beforeEach(async function () {
            // Add initial liquidity
            await elasticToken.connect(owner).buyTokens(
                "BTC",
                ethers.parseEther("0.001"),
                { value: ethers.parseEther("10.0") }
            );
        });

        it("Should rebase when price increases", async function () {
            // Buy some tokens first
            await elasticToken.connect(user1).buyTokens("BTC", 0n, {
                value: ethers.parseEther("1.0")
            });

            const supplyBefore = await elasticToken.totalSupply();
            
            // Increase price
            await ethers.provider.send("evm_increaseTime", [16]);
            await ethers.provider.send("evm_mine", []);
            await btcFeed.setPrice(BTC_INITIAL_PRICE * 110n / 100n);
            await elasticToken.rebaseSupply();

            expect(await elasticToken.totalSupply()).to.be.gt(supplyBefore);
        });

        it("Should rebase when price decreases", async function () {
            // Buy some tokens first
            await elasticToken.connect(user1).buyTokens("BTC", 0n, {
                value: ethers.parseEther("1.0")
            });

            const supplyBefore = await elasticToken.totalSupply();
            
            // Decrease price
            await ethers.provider.send("evm_increaseTime", [16]);
            await ethers.provider.send("evm_mine", []);
            await btcFeed.setPrice(BTC_INITIAL_PRICE * 90n / 100n);
            await elasticToken.rebaseSupply();

            expect(await elasticToken.totalSupply()).to.be.lt(supplyBefore);
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to withdraw taxes", async function () {
            // Generate some taxes first
            await elasticToken.connect(user1).buyTokens("BTC", 0n, {
                value: ethers.parseEther("1.0")
            });

            const balanceBefore = await ethers.provider.getBalance(owner.address);
            await elasticToken.withdrawTaxes();            const balanceAfter = await ethers.provider.getBalance(owner.address);

            expect(balanceAfter).to.be.gt(balanceBefore);
        });

        it("Should prevent non-owners from withdrawing taxes", async function () {
            await expect(
                elasticToken.connect(user1).withdrawTaxes()
            ).to.be.revertedWith("Only owner");
        });
    });

    describe("Security Features", function () {
        describe("Reentrancy Protection", function () {
            it("Should prevent reentrant calls on buyTokens", async function () {
                const AttackerFactory = await ethers.getContractFactory("ReentrancyAttacker");
                const attacker = await AttackerFactory.deploy(await elasticToken.getAddress());

                // Fund attacker with ETH
                await owner.sendTransaction({
                    to: await attacker.getAddress(),
                    value: ethers.parseEther("2.0")
                });

                await expect(
                    attacker.attack()
                ).to.be.revertedWith("ReentrancyGuard: reentrant call");
            });
        });

        describe("Flash Loan Protection", function () {
            it("Should prevent multiple trades in same block", async function () {
                await elasticToken.connect(user1).buyTokens(
                    "BTC",
                    0n,
                    { value: ethers.parseEther("1.0") }
                );

                await expect(
                    elasticToken.connect(user1).buyTokens(
                        "BTC",
                        0n,
                        { value: ethers.parseEther("1.0") }
                    )
                ).to.be.revertedWith("Too many trades");
            });
        });

        describe("Price Impact Protection", function () {
            beforeEach(async function() {
                // Set initial price and advance time
                await btcFeed.setPrice(BTC_INITIAL_PRICE);
                await ethers.provider.send("evm_increaseTime", [4]);
                await ethers.provider.send("evm_mine", []);
            });

            it("Should reject price updates with high impact", async function () {
                // Try price update with high impact (20% change)
                await expect(
                    btcFeed.setPrice(BTC_INITIAL_PRICE * 120n / 100n)
                ).to.be.revertedWith("Price impact too high");
            });
        });

        describe("Access Control", function () {
            it("Should allow owner to add operators", async function () {
                await elasticToken.connect(owner).addOperator(user1.address);
                expect(await elasticToken.operators(user1.address)).to.be.true;
            });

            it("Should respect operator limits", async function () {
                // Add operators up to limit
                for(let i = 0; i < 4; i++) {
                    await elasticToken.connect(owner).addOperator(
                        ethers.Wallet.createRandom().address
                    );
                }

                // Try to add one more (owner is already an operator)
                await expect(
                    elasticToken.connect(owner).addOperator(user1.address)
                ).to.be.revertedWith("Too many operators");
            });
        });

        describe("Pause Functionality", function () {
            it("Should allow operators to pause", async function () {
                await elasticToken.connect(owner).pause();
                expect(await elasticToken.paused()).to.be.true;
            });

            it("Should prevent trades while paused", async function () {
                await elasticToken.pause();
                await expect(
                    elasticToken.connect(user1).buyTokens(
                        "BTC",
                        ethers.parseEther("0"),
                        { value: ethers.parseEther("1.0") }
                    )
                ).to.be.revertedWith("Contract is paused");
            });
        });

        describe("Withdrawal Security", function () {
            it("Should enforce withdrawal delay", async function () {
                // Generate some taxes
                await elasticToken.connect(user1).buyTokens(
                    "BTC",
                    0n,
                    { value: ethers.parseEther("1.0") }
                );

                // Initiate withdrawal
                await elasticToken.connect(owner).initiateWithdrawal();
                
                // Try to complete immediately
                await expect(
                    elasticToken.connect(owner).completeWithdrawal(0)
                ).to.be.revertedWith("Withdrawal delay not met");

                // Move time forward
                await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]);
                await ethers.provider.send("evm_mine", []);

                // Should now succeed
                await elasticToken.connect(owner).completeWithdrawal(0);
            });
        });
    });

    // Add mock attacker contract for reentrancy testing
    describe("Attack Resistance", function () {
        beforeEach(async function() {
            await btcFeed.setPrice(BTC_INITIAL_PRICE);
        });

        it("Should resist price manipulation attempts", async function () {
            // Try immediate update without waiting
            await expect(
                btcFeed.setPrice(BTC_INITIAL_PRICE * 105n / 100n)
            ).to.be.revertedWith("Price updated too recently");
        });
    });
});
