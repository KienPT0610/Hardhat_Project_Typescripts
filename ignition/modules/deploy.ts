import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyTokenModule = buildModule("MyTokenModule", (m) => {
    const myToken = m.contract("MyToken", [10000]);

    return { myToken };
});

export default MyTokenModule;