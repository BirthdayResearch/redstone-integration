import { ethers } from "hardhat";
import { ethers as ethersv5 } from "ethersv5.7.2";
import {abi as RedstoneOracleAbi} from "../artifacts/contracts/RedstoneOracle.sol/RedstoneOracle.json"
import {abi as OracleConsumerAbi} from "../artifacts/contracts/OracleConsumer.sol/OracleConsumer.json"
import { CustomDataServiceWrapper } from "../scripts/CustomDataServiceWrapperClass";

describe("Oracle consumer", function () {

  it("Should get the price", async () => {
    const redstoneOracle = await ethers.deployContract("RedstoneOracle");
    const redstoneOracleAddress = await redstoneOracle.getAddress();
    const oracleConsumer = await ethers.deployContract("OracleConsumer", [[ethers.ZeroAddress], [ethers.encodeBytes32String("ETH")], redstoneOracleAddress]);
    const redstoneOracleV5 = new ethersv5.Contract(redstoneOracleAddress, RedstoneOracleAbi, new ethersv5.providers.JsonRpcProvider("http://127.0.0.1:8545"));
    const oracleConsumerV5 = new ethersv5.Contract(await oracleConsumer.getAddress(),OracleConsumerAbi,  new ethersv5.providers.JsonRpcProvider("http://127.0.0.1:8545") )

    const oracleConsumerV5wrapped = new CustomDataServiceWrapper({
      dataServiceId: "redstone-primary-prod",
      dataFeeds: ["ETH"]
    }, 
      redstoneOracleV5
    ).overwriteEthersContract(oracleConsumerV5);

    const result = await oracleConsumerV5wrapped.getPriceFromOracle(ethers.ZeroAddress);
    console.log(result);
  
  })
});
