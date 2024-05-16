import {expect} from 'chai';
import hre, { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';

describe("Marketplace Contract", () => {
    const accounts = hre.ethers.provider;
    const listPrice = hre.ethers.parseEther("0.01");

    async function DeployNFTFixture() {
        const deployer = await accounts.getSigner(0);

        const marketplace = await hre.ethers.deployContract("Marketplace");
        const nft = await hre.ethers.deployContract("NFT", [marketplace.getAddress()]);
    
        const marketplaceAddress = await marketplace.getAddress();

        return {nft, marketplace, marketplaceAddress, deployer};
    }

    describe("Deploy", () => {
        it("Should list an NFT onto the marketplace", async () => {
            const { nft, marketplace, marketplaceAddress, deployer} = await loadFixture(DeployNFTFixture); 

            await nft.mint(deployer.address);
            await nft.approve(marketplaceAddress, 1);
            await marketplace.createListing(1, nft.getAddress(), listPrice);
        });

        it("shoul list an NFT onto the marketplace", async () => {
            const { nft, marketplace, marketplaceAddress, deployer} = await loadFixture(DeployNFTFixture); 

            const acc2 = await accounts.getSigner(1);

            await nft.mint(deployer.address);
            await nft.approve(marketplaceAddress, 1);
            await marketplace.createListing(1, nft.getAddress(), listPrice);

            await expect(
                await marketplace
                .connect(acc2)
                .buyListing(1, nft.getAddress(), {value: listPrice})
            );

            const item = await marketplace.getMarketItem(1);
            expect(item.owner).to.equal(acc2.address);
        });

        it("Test a market sale that does not send sufficient funds", async () => {
            const { nft, marketplace, marketplaceAddress, deployer} = await loadFixture(DeployNFTFixture); 

            const acc2 = await accounts.getSigner(1);

            await nft.mint(deployer.address);
            await nft.approve(marketplaceAddress, 1);
            await marketplace.createListing(1, nft.getAddress(), listPrice);

            await expect(
                marketplace
                .connect(acc2)
                .buyListing(1, nft.getAddress(), {value: ethers.parseEther("0.002")})
            ).to.be.revertedWith(
                "Value sent does not meet list price for NFT"
            );

            const item = await marketplace.getMarketItem(1);
        
            expect(item.owner).to.equal(deployer.address);
        });

        it("Should get my list nft", async () => {
            const {nft, marketplace, deployer} = await loadFixture(DeployNFTFixture);
            
            const acc2 = await accounts.getSigner(1);

            await nft.mint(deployer.address);
            await nft.setApprovalForAll(marketplace.getAddress(), true);

            await marketplace.createListing(1, nft.getAddress(), listPrice);

            await expect(
                await marketplace
                .connect(acc2)
                .buyListing(1, nft.getAddress(), {value: listPrice})
            );

            const items = await marketplace.connect(acc2).getMyListNFTs();
            expect(items.length).to.equal(1);

        });
    });
});