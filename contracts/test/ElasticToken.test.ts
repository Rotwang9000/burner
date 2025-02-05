import { expect } from "chai";
import { ethers } from "hardhat";
import { 
    ElasticToken,
    MockPriceFeed 
} from "../typechain-types";
import {
    HardhatEthersSigner
} from "@nomicfoundation/hardhat-ethers/signers";

describe("ElasticToken", function () {
    let elasticToken: ElasticToken;
    let btcFeed: MockPriceFeed;
    let ethFeed: MockPriceFeed;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;

    // Update price constants to be very different
    const BTC_INITIAL_PRICE = 50000n * (10n ** 8n);  // $50,000 with 8 decimals
    const ETH_INITIAL_PRICE = 2000n * (10n ** 8n);   // $2,000 with 8 decimals

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const MockPriceFeedFactory = await ethers.getContractFactory("MockPriceFeed");
        btcFeed = await MockPriceFeedFactory.deploy(BTC_INITIAL_PRICE) as unknown as MockPriceFeed;
        await btcFeed.waitForDeployment();
        await btcFeed.setDescription("BTC");

        ethFeed = await MockPriceFeedFactory.deploy(ETH_INITIAL_PRICE) as unknown as MockPriceFeed;
        await ethFeed.waitForDeployment();
        await ethFeed.setDescription("ETH");

        const ElasticTokenFactory = await ethers.getContractFactory("ElasticToken");
        elasticToken = await ElasticTokenFactory.deploy() as unknown as ElasticToken;
        await elasticToken.waitForDeployment();

        // Add regular tokens
        await elasticToken.addSymbol(await btcFeed.getAddress(), false);
        await elasticToken.addSymbol(await ethFeed.getAddress(), false);
    });

    describe("Symbol Management", function () {
        it("Should add new symbols with incrementing IDs", async function () {
            expect(await elasticToken.symbolById(1)).to.equal("BTC");
            expect(await elasticToken.symbolById(2)).to.equal("ETH");
            expect(await elasticToken.idBySymbol("BTC")).to.equal(1);
            expect(await elasticToken.idBySymbol("ETH")).to.equal(2);
        });

        it("Should get symbol info by ID", async function () {
            const symbol = await elasticToken.symbolById(1);
            expect(symbol).to.equal("BTC");
        });
    });

    describe("Token Operations", function () {
        it("Should allow buying and selling tokens", async function () {
            const buyAmount = ethers.parseEther("1.0");
            const btcHash = await elasticToken.getSymbolHash("BTC");

            // Buy tokens using BTC (id 1)
            let tx = await elasticToken.connect(user1).buyTokensByIndex(
                1, 
                0n,
                { value: buyAmount }
            );
            await tx.wait();
            
            const balance = await elasticToken.balanceOf(btcHash, user1.address);
            expect(balance).to.be.gt(0n);

            // Mine a block before selling to prevent flash loan protection
            await ethers.provider.send("evm_mine", []);
            
            tx = await elasticToken.connect(user1).sellTokensByIndex(1, balance);
            await tx.wait();

            expect(await elasticToken.balanceOf(btcHash, user1.address)).to.equal(0n);
        });

        it("Should maintain separate balances for each symbol", async function () {
            const buyAmount = ethers.parseEther("1.0");
            const btcHash = await elasticToken.getSymbolHash("BTC");
            const ethHash = await elasticToken.getSymbolHash("ETH");

            // Buy BTC first
            let tx1 = await elasticToken.connect(user1).buyTokensByIndex(
                1,
                0n,
                { value: buyAmount }
            );
            await tx1.wait();
            
            // Mine blocks before second trade
            await ethers.provider.send("evm_mine", []);
            await ethers.provider.send("evm_mine", []);
            
            // Buy ETH second
            let tx2 = await elasticToken.connect(user1).buyTokensByIndex(
                2,
                0n,
                { value: buyAmount }
            );
            await tx2.wait();
            
            const btcBalance = await elasticToken.balanceOf(btcHash, user1.address);
            const ethBalance = await elasticToken.balanceOf(ethHash, user1.address);

            // Since ETH price is lower, we should get more ETH tokens than BTC tokens
            expect(ethBalance).to.be.gt(btcBalance, "Should get more ETH tokens than BTC tokens");

            // Expected ratio should be roughly BTC_PRICE / ETH_PRICE (25)
            const ratio = Number(ethBalance) / Number(btcBalance);
            const expectedRatio = Number(BTC_INITIAL_PRICE) / Number(ETH_INITIAL_PRICE);
            
            // Allow 10% margin of error
            const difference = Math.abs(ratio - expectedRatio);
            expect(difference).to.be.lt(expectedRatio * 0.1, "Balance ratio should be close to price ratio");
        });

        it("Should not mix balances between symbols", async function () {
            const buyAmount = ethers.parseEther("1.0");

            // Buy only BTC tokens
            await elasticToken.connect(user1).buyTokensByIndex(
                1,
                0n,
                { value: buyAmount }
            );

            const btcHash = await elasticToken.getSymbolHash("BTC");
            const ethHash = await elasticToken.getSymbolHash("ETH");

            const btcBalance = await elasticToken.balanceOf(btcHash, user1.address);
            const ethBalance = await elasticToken.balanceOf(ethHash, user1.address);

            expect(btcBalance).to.be.gt(0n);
            expect(ethBalance).to.equal(0n);
        });

        it("Should track total supply per symbol", async function () {
            const buyAmount = ethers.parseEther("1.0");

            await elasticToken.connect(user1).buyTokensByIndex(
                1,
                0n,
                { value: buyAmount }
            );

            const btcHash = await elasticToken.getSymbolHash("BTC");
            const totalSupplyBtc = await elasticToken.totalSupplyBySymbol(btcHash);
            const btcBalance = await elasticToken.balanceOf(btcHash, user1.address);

            expect(totalSupplyBtc).to.equal(btcBalance);
        });

        it("Should properly handle selling specific symbols", async function () {
            const buyAmount = ethers.parseEther("1.0");
            const btcHash = await elasticToken.getSymbolHash("BTC");
            const ethHash = await elasticToken.getSymbolHash("ETH");

            // Buy both BTC and ETH
            await elasticToken.connect(user1).buyTokensByIndex(1, 0n, { value: buyAmount });
            
            // Mine blocks between trades
            await ethers.provider.send("evm_mine", []);
            await ethers.provider.send("evm_mine", []);
            
            await elasticToken.connect(user1).buyTokensByIndex(2, 0n, { value: buyAmount });

            const btcBalanceBefore = await elasticToken.balanceOf(btcHash, user1.address);
            const ethBalanceBefore = await elasticToken.balanceOf(ethHash, user1.address);

            // Mine blocks before selling
            await ethers.provider.send("evm_mine", []);
            await ethers.provider.send("evm_mine", []);

            // Sell only BTC
            await elasticToken.connect(user1).sellTokensByIndex(1, btcBalanceBefore);

            const btcBalanceAfter = await elasticToken.balanceOf(btcHash, user1.address);
            const ethBalanceAfter = await elasticToken.balanceOf(ethHash, user1.address);

            expect(btcBalanceAfter).to.equal(0n);
            expect(ethBalanceAfter).to.equal(ethBalanceBefore);
        });
    });

    describe("Token Transfers", function () {
        it("Should correctly transfer tokens between users for specific symbols", async function () {
            const buyAmount = ethers.parseEther("1.0");
            
            // Buy tokens first
            await elasticToken.connect(user1).buyTokensByIndex(1, 0n, { value: buyAmount });
            
            const btcHash = await elasticToken.getSymbolHash("BTC");
            const balance = await elasticToken.balanceOf(btcHash, user1.address);
            const transferAmount = balance / 2n;

            // Transfer half the tokens
            await elasticToken.connect(user1).transfer(btcHash, user2.address, transferAmount);

            expect(await elasticToken.balanceOf(btcHash, user1.address)).to.equal(transferAmount);
            expect(await elasticToken.balanceOf(btcHash, user2.address)).to.equal(transferAmount);
        });
    });

    describe("Stats Tracking", function () {
        it("Should track holder stats correctly", async function () {
            // Buy tokens using BTC (id 1)
            await elasticToken.connect(user1).buyTokensByIndex(
                1,
                0n,
                { value: ethers.parseEther("1.0") }
            );

            const stats = await elasticToken.getSymbolStats(1);
            expect(stats[1]).to.be.gt(0n); // holders count
        });

        it("Should track trading activity", async function () {
            // First trade
            await elasticToken.connect(user1).buyTokensByIndex(
                1,
                0n,
                { value: ethers.parseEther("1.0") }
            );
            
            const symbolHash = await elasticToken.getSymbolHash("BTC");
            const blockNum = await ethers.provider.getBlockNumber();
            const block = await ethers.provider.getBlock(blockNum);
            if (!block) throw new Error("Block not found");
            const currentHour = Math.floor(Number(block.timestamp) / 3600);
            
            const tradesThisHour = await elasticToken.tradesPerHour(symbolHash, currentHour);
            expect(tradesThisHour).to.equal(1n);
        });
    });

    describe("Long Positions", function () {
        beforeEach(async function () {
            // Add initial liquidity using BTC (id 1)
            await elasticToken.connect(owner).buyTokensByIndex(
                1,
                ethers.parseEther("0.001"),
                { value: ethers.parseEther("10.0") }
            );
        });

        it("Should open long positions by ID", async function () {
            await elasticToken.connect(user1).openLongPositionByIndex(
                1,
                { value: ethers.parseEther("1.0") }
            );

            const position = await elasticToken.getPositionInfo(user1.address);
            expect(position.ethAmount).to.equal(ethers.parseEther("1.0"));
        });
    });

    describe("Position Management", function () {
        beforeEach(async function () {
            // Add initial liquidity using BTC (id 1)
            await elasticToken.connect(owner).buyTokensByIndex(
                1,
                0n,
                { value: ethers.parseEther("10.0") }
            );
        });

        it("Should open and close long positions", async function () {
            // Open position
            await elasticToken.connect(user1).openLongPositionByIndex(
                1,
                { value: ethers.parseEther("1.0") }
            );

            const position = await elasticToken.getPositionInfo(user1.address);
            expect(position.ethAmount).to.equal(ethers.parseEther("1.0"));

            // Close position
            await elasticToken.connect(user1).closeLongPosition();
            
            // Verify position is closed
            await expect(
                elasticToken.getPositionInfo(user1.address)
            ).to.be.revertedWith("No position");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to withdraw taxes", async function () {
            // Generate some taxes first using BTC (id 1)
            await elasticToken.connect(user1).buyTokensByIndex(1, 0n, {
                value: ethers.parseEther("1.0")
            });

            const balanceBefore = await ethers.provider.getBalance(owner.address);
            await elasticToken.withdrawTaxes();
            const balanceAfter = await ethers.provider.getBalance(owner.address);

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
                const attacker = await AttackerFactory.deploy(await elasticToken.getAddress()) as any;
                await attacker.waitForDeployment();

                // Fund attacker with ETH
                await owner.sendTransaction({
                    to: await attacker.getAddress(),
                    value: ethers.parseEther("2.0")
                });

                await expect(
                    attacker.attack({ value: ethers.parseEther("1.0") })
                ).to.be.revertedWith("ReentrancyGuard: reentrant call");
            });
        });

        describe("Flash Loan Protection", function () {
            it("Should prevent multiple trades in same block", async function () {
                await elasticToken.connect(user1).buyTokensByIndex(
                    1,
                    0n,
                    { value: ethers.parseEther("1.0") }
                );

                await expect(
                    elasticToken.connect(user1).buyTokensByIndex(
                        1,
                        0n,
                        { value: ethers.parseEther("1.0") }
                    )
                ).to.be.reverted;
            });
        });

        describe("Access Control", function () {
            it("Should allow owner to add operators", async function () {
                await elasticToken.connect(owner).addOperator(user1.address);
                expect(await elasticToken.operators(user1.address)).to.be.true;
            });

            it("Should respect operator limits", async function () {
                for(let i = 0; i < 4; i++) {
                    const randomWallet = ethers.Wallet.createRandom().address;
                    await elasticToken.connect(owner).addOperator(randomWallet);
                }
                await expect(
                    elasticToken.connect(owner).addOperator(user1.address)
                ).to.be.revertedWith("Too many operators");
            });
        });

        describe("Withdrawal Security", function () {
            it("Should enforce withdrawal delay", async function () {
                await elasticToken.connect(user1).buyTokensByIndex(
                    1,
                    0n,
                    { value: ethers.parseEther("1.0") }
                );

                await elasticToken.connect(owner).initiateWithdrawal();
                
                await expect(
                    elasticToken.connect(owner).completeWithdrawal(0)
                ).to.be.revertedWith("Withdrawal delay not met");

                await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]);
                await ethers.provider.send("evm_mine", []);

                await elasticToken.connect(owner).completeWithdrawal(0);
            });
        });
    });

    describe("Tax Management", function () {
        it("Should collect correct tax amount on buys", async function () {
            const buyAmount = ethers.parseEther("1.0");
            const expectedTax = (buyAmount * BigInt(500)) / BigInt(10000); // 5% tax

            const initialTaxes = await elasticToken.collectedTaxes();
            
            await elasticToken.connect(user1).buyTokensByIndex(1, 0n, {
                value: buyAmount
            });

            const finalTaxes = await elasticToken.collectedTaxes();
            expect(finalTaxes - initialTaxes).to.equal(expectedTax);
        });

        it("Should collect correct tax amount on sells", async function () {
            // First buy some tokens
            const buyAmount = ethers.parseEther("1.0");
            await elasticToken.connect(user1).buyTokensByIndex(1, 0n, {
                value: buyAmount
            });

            const btcHash = await elasticToken.getSymbolHash("BTC");
            const balance = await elasticToken.balanceOf(btcHash, user1.address);

            const taxesBefore = await elasticToken.collectedTaxes();
            
            // Sell all tokens
            await elasticToken.connect(user1).sellTokensByIndex(1, balance);
            
            const taxesAfter = await elasticToken.collectedTaxes();
            expect(taxesAfter).to.be.gt(taxesBefore);
        });

        it("Should allow owner to withdraw taxes", async function () {
            // Generate some taxes
            const buyAmount = ethers.parseEther("1.0");
            await elasticToken.connect(user1).buyTokensByIndex(1, 0n, {
                value: buyAmount
            });

            const initialTaxes = await elasticToken.collectedTaxes();
            expect(initialTaxes).to.be.gt(0);

            // Check owner's balance before and after
            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
            
            // Withdraw taxes
            await elasticToken.connect(owner).withdrawTaxes();
            
            // Verify taxes were withdrawn
            expect(await elasticToken.collectedTaxes()).to.equal(0);
            
            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
            expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
        });

        it("Should prevent non-owners from withdrawing taxes", async function () {
            await expect(
                elasticToken.connect(user1).withdrawTaxes()
            ).to.be.revertedWith("Only owner");
        });

        it("Should correctly handle withdrawal delays", async function () {
            // Generate some taxes
            await elasticToken.connect(user1).buyTokensByIndex(1, 0n, {
                value: ethers.parseEther("1.0")
            });

            // Initiate withdrawal
            await elasticToken.connect(owner).initiateWithdrawal();
            
            // Try to complete immediately (should fail)
            await expect(
                elasticToken.connect(owner).completeWithdrawal(0)
            ).to.be.revertedWith("Withdrawal delay not met");

            // Move time forward 2 days
            await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine", []);

            // Now should succeed
            await elasticToken.connect(owner).completeWithdrawal(0);
            expect(await elasticToken.collectedTaxes()).to.equal(0);
        });

        it("Should accumulate taxes from multiple trades", async function () {
            const buyAmount = ethers.parseEther("1.0");
            const expectedTaxPerTrade = (buyAmount * BigInt(500)) / BigInt(10000); // 5%

            // Multiple users make trades
            await elasticToken.connect(user1).buyTokensByIndex(1, 0n, { value: buyAmount });
            await elasticToken.connect(user2).buyTokensByIndex(1, 0n, { value: buyAmount });

            const totalTaxes = await elasticToken.collectedTaxes();
            expect(totalTaxes).to.equal(expectedTaxPerTrade * BigInt(2));
        });
    });

    describe("Short Selling", function () {
        beforeEach(async function () {
            // Add initial liquidity
            await elasticToken.connect(owner).buyTokensByIndex(
                1,  // BTC
                0n,
                { value: ethers.parseEther("10.0") }
            );
        });

        it("Should allow selling without owning tokens (short position)", async function () {
            const btcHash = await elasticToken.getSymbolHash("BTC");
            const sellAmount = ethers.parseEther("1.0");
            
            // Calculate collateral needed (roughly 1.5 ETH worth for 1.0 token)
            const collateralAmount = ethers.parseEther("1.5");
            
            // Create short position with collateral
            await elasticToken.connect(user1).sellTokensByIndex(
                1, 
                sellAmount, 
                { value: collateralAmount }
            );
            
            const [isShort, position] = await elasticToken.getPositionType(btcHash, user1.address);
            expect(isShort).to.be.true;
            expect(position).to.equal(-sellAmount);
        });

        it("Should profit from short when price decreases", async function () {
            const sellAmount = ethers.parseEther("1.0");
            const collateralAmount = ethers.parseEther("1.5");

            await elasticToken.connect(user1).sellTokensByIndex(1, sellAmount, {
                value: collateralAmount
            });
            const initialBalance = await ethers.provider.getBalance(user1.address);

            // Decrease price by 10%
            const newPrice = (BTC_INITIAL_PRICE * 90n) / 100n;
            await btcFeed.setPrice(newPrice);
            await ethers.provider.send("evm_increaseTime", [15]);
            await ethers.provider.send("evm_mine", []);

            // Trigger rebase
            await elasticToken.rebaseSupply();

            // Close position (buy back)
            await elasticToken.connect(user1).buyTokensByIndex(
                1,
                0n,
                { value: ethers.parseEther("0.9") }  // Less ETH needed to buy back
            );

            const finalBalance = await ethers.provider.getBalance(user1.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should lose from short when price increases", async function () {
            const btcHash = await elasticToken.getSymbolHash("BTC");
            const sellAmount = ethers.parseEther("1.0");
            const collateralAmount = ethers.parseEther("1.5");

            // Open short position
            await elasticToken.connect(user1).sellTokensByIndex(1, sellAmount, {
                value: collateralAmount
            });
            const initialBalance = await ethers.provider.getBalance(user1.address);

            // Increase price by 10%
            const newPrice = (BTC_INITIAL_PRICE * 110n) / 100n;
            await btcFeed.setPrice(newPrice);
            await ethers.provider.send("evm_increaseTime", [15]);
            await ethers.provider.send("evm_mine", []);

            // Trigger rebase
            await elasticToken.rebaseSupply();

            // Close position (buy back)
            await elasticToken.connect(user1).buyTokensByIndex(
                1,
                0n,
                { value: ethers.parseEther("1.1") }  // More ETH needed to buy back
            );

            const finalBalance = await ethers.provider.getBalance(user1.address);
            expect(finalBalance).to.be.lt(initialBalance);
        });

        it("Should track short positions separately from regular positions", async function () {
            const btcHash = await elasticToken.getSymbolHash("BTC");
            
            // User1 goes short
            await elasticToken.connect(user1).sellTokensByIndex(1, ethers.parseEther("1.0"));
            
            // User2 goes long
            await elasticToken.connect(user2).buyTokensByIndex(1, 0n, {
                value: ethers.parseEther("1.0")
            });

            const user1Position = await elasticToken.getShortPosition(btcHash, user1.address);
            const user2Balance = await elasticToken.balanceOf(btcHash, user2.address);

            expect(user1Position).to.be.lt(0n);
            expect(user2Balance).to.be.gt(0n);
        });

        it("Should rebase short positions correctly", async function () {
            const btcHash = await elasticToken.getSymbolHash("BTC");
            
            // Open short position
            await elasticToken.connect(user1).sellTokensByIndex(1, ethers.parseEther("1.0"));
            const initialShortPos = await elasticToken.getShortPosition(btcHash, user1.address);

            // Decrease price by 10%
            const newPrice = (BTC_INITIAL_PRICE * 90n) / 100n;
            await btcFeed.setPrice(newPrice);
            await ethers.provider.send("evm_increaseTime", [15]);
            await ethers.provider.send("evm_mine", []);

            await elasticToken.rebaseSupply();

            const finalShortPos = await elasticToken.getShortPosition(btcHash, user1.address);
            expect(finalShortPos).to.be.gt(initialShortPos); // Short position should profit
        });
    });
});
