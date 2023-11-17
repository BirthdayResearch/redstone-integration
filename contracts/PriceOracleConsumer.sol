pragma solidity 0.8.19;

contract PriceOracleConsumer {

    function getPricesForDataFeedsFromOracle(
        bytes32[] memory dataFeedIds, 
        address oracle) 
    public view returns (uint256[] memory) 
    {
        bytes memory redstonePayload = abi.encodeWithSignature("getLatestPrices(bytes32[])", dataFeedIds);
        bytes memory bytesRes;
    
        assembly {
            let initialRedstoneLen := mload(redstonePayload)
            let newRedstoneLen := add(initialRedstoneLen, calldatasize())
            mstore(redstonePayload, newRedstoneLen)
            let oldMemorySize := mload(0x40)
            bytesRes := add(oldMemorySize, calldatasize())
            calldatacopy(oldMemorySize, 0x00, calldatasize())
            let success := staticcall(gas(), oracle, add(redstonePayload, 0x20), newRedstoneLen, 0, 0)
            // construct the memory bytes array
            mstore(bytesRes, returndatasize())
            returndatacopy(add(0x20, bytesRes), 0, returndatasize())
            switch success 
            case 0 {
                // bubble up the error
                revert(add(0x20, bytesRes),returndatasize())
            }
            default {
                mstore(0x40, add(add(bytesRes, 0x20), returndatasize()))
            }
        }

        (uint256[] memory res) =  abi.decode(bytesRes, (uint256[]));

        return res;

    }
}