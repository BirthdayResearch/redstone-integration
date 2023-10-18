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

    function getPriceFromOracle(address _tokenAddress) external view returns (uint256) {
        bytes32 dataFeedId = tokenToDataFeedId[_tokenAddress];
        uint256 payloadSize;
        assembly {
            payloadSize := calldataload(0x24)
        }

        bytes memory redstonePayload = new bytes(payloadSize);
        assembly {
            calldatacopy(add(redstonePayload, 0x20), 0x44, payloadSize)
        }
        
        return oracleContract.getLatestPriceWithPayload(dataFeedId, redstonePayload);
    } 
}