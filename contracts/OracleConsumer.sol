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

    function mockSwap(address firstToken, address secondToken ) public view returns(uint256) {
        return getPriceFromOracle(address(0));
    }

    function getPriceFromOracle(address _tokenAddress) public view returns (uint256) 
    {
        bytes32 dataFeedId = tokenToDataFeedId[_tokenAddress];
        uint256 oracleCallDataSize;
        address oracleContractAddress = address(oracleContract);
        
        assembly {
            oracleCallDataSize := add(calldatasize(), 0x24)
        }

        bytes memory redstonePayload = new bytes(oracleCallDataSize);
    
        assembly {
            mstore8(add(redstonePayload, 0x20), 0xb2)
            mstore8(add(redstonePayload, 0x21), 0xee)
            mstore8(add(redstonePayload, 0x22), 0x2f)
            mstore8(add(redstonePayload, 0x23), 0x01)
            mstore(add(redstonePayload, 0x24), dataFeedId)
            calldatacopy(add(redstonePayload, 0x44), 0x00, sub(oracleCallDataSize, 0x24))
            let oldMemorySize := mload(0x40)
            let success := staticcall(gas(), oracleContractAddress, add(redstonePayload, 0x20), oracleCallDataSize, 0, 0)
            returndatacopy(oldMemorySize, 0, returndatasize())
            mstore(0x40, add(oldMemorySize, returndatasize()))
            switch success
            case 0  {
                revert(oldMemorySize, returndatasize())
            }
            default {
                return(oldMemorySize, returndatasize())
            }
        }

    } 
}