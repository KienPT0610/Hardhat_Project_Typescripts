import { expect } from 'chai'; 
import hre from 'hardhat';
import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe('MyToken Contract', () => {    
    const initialSupply = 1000;
    const providers = hre.ethers.provider;
    async function DeployMyTokenFixture() {
        const token = await hre.ethers.deployContract("MyToken",[initialSupply]);
        const deployer = await providers.getSigner(0);
        
        return { token, deployer};
    }

    describe('Deployment', () => {
        it('has the correct name and symbol', async () => {
            const {token} = await loadFixture(DeployMyTokenFixture);
            const name = await token.name();
            const symbol = await token.symbol();
            const decimals = await token.decimals();
            
            expect(name).to.equal('MyToken');
            expect(symbol).to.equal('MT');
            expect(decimals).to.equal(18);        
        });

        it('has the correct initial supply minted to the deployer', async () => {
            const {token, deployer} = await loadFixture(DeployMyTokenFixture);
            const deployerBalance = await token.balanceOf(deployer.address);

            expect(deployerBalance).to.equal(initialSupply);
        });
    });

    describe('Transfer functionality (assuming ERC20 standard is implemented correctly)', () => {
        
        it('transfers tokens from the deployer to a recipient', async () => {
            const {token, deployer} = await loadFixture(DeployMyTokenFixture);
            const transferAmount = 100;
            const recipient = await providers.getSigner(1);
            
            // balances before of deployer and recipient
            const deployerBalanceBefore = await token.balanceOf(deployer.address);
            const recipientBalanceBefore = await token.balanceOf(recipient.address);

            const tx = await token.transfer(recipient.address, transferAmount);
            await tx.wait(); // Wait for transaction confirmation

            const deployerBalanceAfter = await token.balanceOf(deployer.getAddress());
            const recipientBalanceAfter = await token.balanceOf(recipient.getAddress());
            
            expect(deployerBalanceAfter).to.equal(deployerBalanceBefore - BigInt(transferAmount));
            expect(recipientBalanceAfter).to.equal(recipientBalanceBefore + BigInt(transferAmount));
        });

        it("emit an Transfer recipient when called", async () => {
            const {token, deployer} = await loadFixture(DeployMyTokenFixture);
            const transferAmount = 100;
            const recipient = await providers.getSigner(1);

            const filters = token.filters.Transfer(deployer.address, recipient.address, undefined);
            await expect(token.transfer(recipient.address, transferAmount)).to.emit(token, "Transfer");

            const events = await token.queryFilter(filters);
            // expect(events[0].args.from).to.equal(deployer.address);
            // expect(events[0].args.to).to.equal(recipient.address);
            // expect(events[0].args.value).to.equal(transferAmount);
        });
    });

    describe("Transfer function", () => {
        it("Approve tokens from owner to a spender", async () => {
            const {token, deployer} = await loadFixture(DeployMyTokenFixture); 

            const approvalAmount = 150;
            const spender = await providers.getSigner(2);
            
            const tx = await token.approve(spender.address, approvalAmount);
            await tx.wait();

            const allowance = await token.allowance(deployer.address, spender.address);

            expect(allowance).to.equal(approvalAmount);
        });

        it("emit an Approval event when called", async () => {
            const {token, deployer} = await loadFixture(DeployMyTokenFixture);
            
            const spender = await providers.getSigner(2);
            const approvalAmount = 200;
            const filters = token.filters.Approval(deployer.address, spender.address, undefined);

            await expect(token.approve(spender.address, approvalAmount)).to.emit(token, 'Approval');

            const events = await token.queryFilter(filters);
            expect(events.length).to.equal(1);
            // expect(events[0].args.owner).to.equal(deployer.address); 
            // expect(events[0].args.spender).to.equal(spender.address); 
            // expect(events[0].args.value).to.equal(approvalAmount); 
        });
    });
});