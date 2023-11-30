// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@redstone-finance/evm-connector/contracts/data-services/PrimaryProdDataServiceConsumerBase.sol";

contract RedstoneOracle is PrimaryProdDataServiceConsumerBase {

    function getLatestPrice(bytes32 dataFeedId) public view returns (uint256) {
        return getOracleNumericValueFromTxMsg(dataFeedId);
    }

    function getLatestPrices(bytes32[] memory dataFeedIds) public view returns (uint256[] memory) {
        return getOracleNumericValuesFromTxMsg(dataFeedIds);
    }
}