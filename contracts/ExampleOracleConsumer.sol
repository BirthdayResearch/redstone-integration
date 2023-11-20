// SPDX-License-Identifier: UNLICENSED

import "@redstone-finance/evm-connector/contracts/data-services/PrimaryProdDataServiceConsumerBase.sol";

contract ExampleOracleConsumer is PrimaryProdDataServiceConsumerBase {

    function getLatestPrice(bytes32 dataFeedId) public view returns (uint256) {
        return getOracleNumericValueFromTxMsg(dataFeedId);
    }

    function getLatestPrices(bytes32[] memory dataFeedIds) public view returns (uint256[] memory) {
        return getOracleNumericValuesFromTxMsg(dataFeedIds);
    }

    function getLatestEthPrice() public view returns (uint256) {
        return getOracleNumericValueFromTxMsg(bytes32("ETH"));
    }
}