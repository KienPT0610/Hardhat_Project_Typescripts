import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const PRIVATE_KEY_ACCOUNT_1 = vars.get("PRIVATE_KEY_ACCOUNT_1");


const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://mainnet.infura.io/v3/${ETHERSCAN_API_KEY}`,
      accounts: [PRIVATE_KEY_ACCOUNT_1]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    }
  }
};

export default config;
