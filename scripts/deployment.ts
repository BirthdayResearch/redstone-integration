import {ethers} from "hardhat";
import { run } from "hardhat";

async function main() {
    const redstoneOracle = await ethers.deployContract("RedstoneOracle");
    await redstoneOracle.deploymentTransaction()?.wait(5);
    const redstoneOracleAddress = await redstoneOracle.getAddress();
    console.log("Verifying smart contract");
    try {
        await run('verify:verify', {
            address: redstoneOracleAddress, 
            contract: 'contracts/RedstoneOracle.sol:RedstoneOracle'
        });
    } catch(e) {
        console.log(e);
    }
}

main().catch((error) => {
    console.error(error); 
    process.exitCode = 1;
})