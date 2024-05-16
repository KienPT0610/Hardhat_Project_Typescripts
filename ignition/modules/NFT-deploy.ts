import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyNFTModule = buildModule("MyNFTModule", (m) => {
  // const marketplace = m.contract("Marketplace");
  const nft = m.contract("NFT", [0x5fbdb2315678afecb367f032d93f642f64180aa3]);

  return { nft };
});

export default MyNFTModule;