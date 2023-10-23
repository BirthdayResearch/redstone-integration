// SPDX-License-Identifier: UNLICENSED

import "@redstone-finance/evm-connector/contracts/data-services/PrimaryProdDataServiceConsumerBase.sol";

contract RedstoneOracle is PrimaryProdDataServiceConsumerBase {

    function getLatestPrice(bytes32 dataFeedId) public view returns (uint256) {
        return getOracleNumericValueFromTxMsg(dataFeedId);
    }

    function getLatestPriceWithPayload(bytes32 dataFeedId, bytes memory payload) public view returns (uint256) {
        return getOracleNumericValueFromTxMsg(dataFeedId);
    }

    function getLatestPrices(bytes32[] memory dataFeedIds) public view returns (uint256[] memory) {
        return getOracleNumericValuesFromTxMsg(dataFeedIds);
    }
}