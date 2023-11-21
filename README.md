# Redstone MetaChain integration

This repo aims to integrate Redstone oracle with DefiMetaChain
It is inspired from the example here: https://docs.redstone.finance/docs/smart-contract-devs/get-started/redstone-core

## How to test

```
npx hardhat node
npx hardhat test --network localhost 
```

## How to use the package

On the contracts side: 
```
import "@waveshq/redstone-metachain-integration/contracts/PriceOracleConsumer.sol"; 

contract OracleConsumer is PriceOracleConsumer { 
    address public oracleContractAddress; 

    constructor(address _oracleContractAddress) { 
        oracleContractAddress = _oracleContractAddress;
    }

    function mockSwap(bytes32[] calldata dataFeedIds) public view returns (uint256[] memory) {
        uint256[] memory prices = getPricesForDataFeedsFromOracle(dataFeedIds, oracleContractAddress)
        return prices;
    }
}
```

On the backend/ frontend side: 
```javascript
import {CustomDataServiceWrapper} from "@waveshq/redstone-metachain-integration";
import {abi as RedstoneOracleAbi} from "@waveshq/redstone-metachain-integration/artifacts/contracts/RedstoneOracle.sol/RedstoneOracle.json";
import {abi as OracleConsumerAbi} from ""; // import abi for your smart contract
import {ethers} from "ethers"; // should be ethersv5

const redstoneOracle = new ethers.Contract(REDSTONE_ORACLE_ADDRESS, RedstoneOracleAbi, ethereum_provider);
const oracleConsumer = new ethers.Contract(ORACLE_CONSUMER_ADDRESS, OracleConsumerAbi, ethereum_provider);

const oracleConsumerWrapped = new CustomDataServiceWrapper({
    dataFeedId: "redstone-primary-prod", 
    dataFeeds: ["ETH", "BTC"]
}, 
    redstoneOracle 
).overwriteEthersContract(
    oracleConsumer 
)

await oracleConsumerWrapped.mockSwap([ethers.encodeBytes32String("ETH"), ethers.encodeBytes32String("BTC")]);
// this should fetch the correct prices for eth and btc
```