import { ethers } from "hardhat";
import {DataServiceWrapper} from "@redstone-finance/evm-connector/dist/src/wrappers/DataServiceWrapper";
import { ethers as ethersv5 } from "ethersv5.7.2";
import {abi as RedstoneOracleAbi} from "../artifacts/contracts/RedstoneOracle.sol/RedstoneOracle.json"
import {expect} from "chai";

describe("Oracle consumer", function () {

  it("Should get the price", async () => {
    const redstoneOracle = await ethers.deployContract("RedstoneOracle");
    const redstoneOracleAddress = await redstoneOracle.getAddress();
    const oracleConsumer = await ethers.deployContract("OracleConsumer", [[ethers.ZeroAddress], [ethers.encodeBytes32String("ETH")], redstoneOracleAddress]);
    const redstoneOracleV5 = new ethersv5.Contract(redstoneOracleAddress, RedstoneOracleAbi, new ethersv5.providers.JsonRpcProvider("http://127.0.0.1:8545"));
    const redstonePayload = await (new DataServiceWrapper({
      dataServiceId: "redstone-primary-prod",
      dataFeeds: ["ETH"]
    })).getRedstonePayloadForManualUsage(redstoneOracleV5);

    expect(BigInt(await ((await ethers.getSigners())[0]).call(
      {
        data: oracleConsumer.interface.encodeFunctionData("getPriceFromOracle", [ethers.ZeroAddress]) + ethers.AbiCoder.defaultAbiCoder().encode(["bytes"],[redstonePayload]).slice(66),
        to: await oracleConsumer.getAddress(),
      }))).to.gt(0n);

  })
});
