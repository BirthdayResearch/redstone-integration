import "./RedstoneOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OracleConsumer is Ownable {
    mapping(address => bytes32) public tokenToDataFeedId;
    RedstoneOracle oracleContract;

    constructor(address[] memory tokenAddresses, bytes32[] memory dataFeedIds, address _oracleContract) Ownable() {
        for (uint i = 0; i < tokenAddresses.length; i++) {
            tokenToDataFeedId[tokenAddresses[i]] = dataFeedIds[i];
        }
        oracleContract = RedstoneOracle(_oracleContract);
    }

    function mockSwap(address firstToken, address secondToken) public view returns(uint256[] memory) {
        address[] memory tokenAddresses = new address[](1);
        tokenAddresses[0] = firstToken;
        return getPricesFromOracle(tokenAddresses);
    }

    function getPricesFromOracle(address[] memory _tokenAddresses) public view returns (uint256[] memory) 
    {
        bytes32[] memory dataFeedIds = new bytes32[](_tokenAddresses.length);
        for (uint i = 0; i < _tokenAddresses.length; i++) {
            dataFeedIds[i] = tokenToDataFeedId[_tokenAddresses[i]];
        }
        address oracleContractAddress = address(oracleContract);        
        bytes memory redstonePayload = abi.encodeWithSignature("getLatestPrices(bytes32[])", dataFeedIds);
        
        assembly {
            let initialRedstoneLen := mload(redstonePayload)
            let newRedstoneLen := add(initialRedstoneLen, calldatasize())
            mstore(redstonePayload, newRedstoneLen)
            let oldMemorySize := mload(0x40)
            let newMemorySizeAfterAddingData
            newMemorySizeAfterAddingData := add(oldMemorySize, calldatasize())
            calldatacopy(add(redstonePayload, add(initialRedstoneLen, 0x20)), 0x00, calldatasize())
            let success := staticcall(gas(), oracleContractAddress, add(redstonePayload, 0x20), newRedstoneLen, 0, 0)
            returndatacopy(newMemorySizeAfterAddingData, 0, returndatasize())
            // memory expand because of adding return data to memory
            mstore(0x40, add(newMemorySizeAfterAddingData, returndatasize()))
            switch success
            case 0  {
                revert(newMemorySizeAfterAddingData, returndatasize())
            }
            default {
                return(newMemorySizeAfterAddingData, returndatasize())
            }
        }

    } 
}