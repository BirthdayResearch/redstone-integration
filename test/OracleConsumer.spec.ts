import { ethers } from "hardhat";
import { ethers as ethersv5 } from "ethersv5.7.2";
import {abi as oracleConsumerAbi} from "../artifacts/contracts/ExampleOracleConsumer.sol/ExampleOracleConsumer.json"
import {expect} from "chai";
import { WrapperBuilder } from "@redstone-finance/evm-connector";

describe("Oracle consumer", function () {

  it("Should get the price", async () => {
    const oracleConsumer = await ethers.deployContract("ExampleOracleConsumer");
    const oracleConsumerV5 = new ethersv5.Contract(await oracleConsumer.getAddress(), oracleConsumerAbi, new ethersv5.providers.JsonRpcProvider("http://127.0.0.1:8545"));
    const wrappedConsumerForETH = WrapperBuilder.wrap(oracleConsumerV5).usingDataService({
      dataFeeds: ["ETH"],
      dataServiceId: "redstone-primary-prod"
    })

    expect((await wrappedConsumerForETH.getLatestPrice(ethers.encodeBytes32String("ETH"))).gt(0)).to.be.true;

    expect((await wrappedConsumerForETH.getLatestEthPrice()).gt(0)).to.be.true;

    const wrappedConsumerForBTC = WrapperBuilder.wrap(oracleConsumerV5).usingDataService({
      dataFeeds: ["BTC"],
      dataServiceId: "redstone-primary-prod"
    })

    expect((await wrappedConsumerForBTC.getLatestPrice(ethers.encodeBytes32String("BTC"))).gt(0)).to.be.true;

    const wrappedConsumerForBTCETH = WrapperBuilder.wrap(oracleConsumerV5).usingDataService({
      dataFeeds: ["BTC", "ETH"],
      dataServiceId: "redstone-primary-prod"
    })

    const [BTCPrice, ETHPrice] = await wrappedConsumerForBTCETH.getLatestPrices([ethers.encodeBytes32String("BTC"), ethers.encodeBytes32String("ETH")]);

    expect(BTCPrice.gt(0)).to.be.true;
    expect(ETHPrice.gt(0)).to.be.true;


  })
});
