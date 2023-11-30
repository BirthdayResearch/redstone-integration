import { ethers } from "hardhat";
import { ethers as ethersv5 } from "ethersv5.7.2";
import {abi as RedstoneOracleAbi} from "../artifacts/contracts/RedstoneOracle.sol/RedstoneOracle.json"
import {abi as OracleConsumerAbi} from "../artifacts/contracts/OracleConsumer.sol/OracleConsumer.json"
import { CustomDataServiceWrapper } from "../scripts/CustomDataServiceWrapperClass";
import {expect} from "chai";
import { RedstoneOracle__factory } from "../typechain-types";

describe("Request data successfully ", function () {

  let redstoneOracleV5: ethersv5.Contract;
  let oracleConsumerV5: ethersv5.Contract;

  before(async () => {
    const redstoneOracle = await ethers.deployContract("RedstoneOracle");
    const redstoneOracleAddress = await redstoneOracle.getAddress();
    const oracleConsumer = await ethers.deployContract("OracleConsumer", [[ethers.ZeroAddress, `0x`+ "0".repeat(39) + `1`], [ethers.encodeBytes32String("ETH"), ethers.encodeBytes32String("BTC")], redstoneOracleAddress]);
    const hardhatNodeProvider = new ethersv5.providers.JsonRpcProvider("http://127.0.0.1:8545");
    // copied the private key of the first account from hardhat
    const signer0 = new ethersv5.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", hardhatNodeProvider );
    redstoneOracleV5 = new ethersv5.Contract(redstoneOracleAddress, RedstoneOracleAbi, hardhatNodeProvider);
    oracleConsumerV5 = new ethersv5.Contract(await oracleConsumer.getAddress(), OracleConsumerAbi,  signer0);
  })

  it("Should get the price when specifying both datafeeds and dataserviceids", async () => {

    const oracleConsumerV5wrapped = new CustomDataServiceWrapper({
      dataServiceId: "redstone-primary-prod",
      dataFeeds: ["ETH", "BTC"]
    }, 
      redstoneOracleV5
    ).overwriteEthersContract(oracleConsumerV5);

    const result = await oracleConsumerV5wrapped.getPricesForTokenAddresses([ethers.ZeroAddress, `0x`+ "0".repeat(39) + `1`]);
    console.log(result);

    let result2: ethersv5.ContractTransaction = await oracleConsumerV5wrapped.mockSwap(ethers.ZeroAddress, `0x`+ "0".repeat(39) + `1`);
    const result2Receipt = await result2.wait();
    const dataToDecode = result2Receipt?.events ? result2Receipt?.events[0].data : "";
    console.log(oracleConsumerV5.interface.decodeEventLog("SWAP_WITH_PRICE", dataToDecode));
  })

  it("Should get the price without specifying the data service id", async () => {
    const oracleConsumerV5wrapped = new CustomDataServiceWrapper({
      dataFeeds: ["ETH", "BTC"]
    },
      redstoneOracleV5 
    ).overwriteEthersContract(oracleConsumerV5);
    
    const oraclePrices = await oracleConsumerV5wrapped.getPricesForTokenAddresses([ethers.ZeroAddress, `0x`+ "0".repeat(39) + `1`]);

    console.log("Oracle prices are ", oraclePrices.map((x: ethersv5.BigNumber) => x.toString()));
  })

  it("Should get a single price", async () => {
    const oracleConsumerV5Wrapped = new CustomDataServiceWrapper({
      dataFeeds: ["ETH"], 
    }, redstoneOracleV5).overwriteEthersContract(oracleConsumerV5);

    console.log("Single price is");
    console.log(await oracleConsumerV5Wrapped.getPriceForTokenAddress(ethers.ZeroAddress));
  })
})

describe( "Request data unsuccessfully ", () => {

  let redstoneOracle: any;
  let oracleConsumer: any;
  let redstoneOracleAddress: string;
  
  before(async () => {
    redstoneOracle = await ethers.deployContract("RedstoneOracle");
    redstoneOracleAddress = await redstoneOracle.getAddress();
    oracleConsumer = await ethers.deployContract("OracleConsumer", [[ethers.ZeroAddress, `0x`+ "0".repeat(39) + `1`], [ethers.encodeBytes32String("ETH"), ethers.encodeBytes32String("BTC")], redstoneOracleAddress]);  
  })

  it("Should bubble up the error if sending invalid data (when requesting for many data feeds)", async () => {
    // change the end of the calldata so that it does not satisfy the REDSTONE_MARKER_MASK requirement
    const callDataToSend = oracleConsumer.interface.encodeFunctionData("mockSwap", [ethers.ZeroAddress, `0x`+ "0".repeat(39) + `1`]) + "0000000000000000000000000000000000000000000000000002ed57011c0000";
    const oracleConsumerInFormRedstoneOracle = RedstoneOracle__factory.connect(await oracleConsumer.getAddress());
    await expect(
      (await ethers.getSigners())[0].sendTransaction({
        data: callDataToSend, 
        to: await oracleConsumer.getAddress()
      })
    ).to.revertedWithCustomError(oracleConsumerInFormRedstoneOracle, "CalldataMustHaveValidPayload");
  })

  it("Should bubble up the error if sending invalid data (when requesting for only one data feed)", async () => {
    // change the end of the calldata so that it does not satisfy the REDSTONE_MARKER_MASK requirement
    const callDataToSend = oracleConsumer.interface.encodeFunctionData("getPriceForTokenAddress", [ethers.ZeroAddress]) + "0000000000000000000000000000000000000000000000000002ed57011c0000";
    const oracleConsumerInFormRedstoneOracle = RedstoneOracle__factory.connect(await oracleConsumer.getAddress());
    await expect(
      (await ethers.getSigners())[0].call({
        data: callDataToSend,
        to: await oracleConsumer.getAddress()
      })
    ).to.revertedWithCustomError(oracleConsumerInFormRedstoneOracle, "CalldataMustHaveValidPayload");
  } )
})
