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

    function mockSwap(address firstToken, address secondToken) public view returns(bool) {
        address[] memory dummyAddreses = new address[](2);
        dummyAddreses[0] = address(1);
        dummyAddreses[1] = address(2);
        address[] memory tokenAddresses = new address[](1);
        tokenAddresses[0] = firstToken;
        getPricesFromOracle(tokenAddresses);
        return true;
    }

    function getPricesFromOracle(address[] memory _tokenAddresses) public view returns (uint256[] memory) 
    {
        bytes32[] memory dataFeedIds = new bytes32[](_tokenAddresses.length);
        for (uint i = 0; i < _tokenAddresses.length; i++) {
            dataFeedIds[i] = tokenToDataFeedId[_tokenAddresses[i]];
        }
        address oracleContractAddress = address(oracleContract);        
        bytes memory redstonePayload = abi.encodeWithSignature("getLatestPrices(bytes32[])", dataFeedIds);
        bytes memory bytesRes;
    
        assembly {
            let initialRedstoneLen := mload(redstonePayload)
            let newRedstoneLen := add(initialRedstoneLen, calldatasize())
            mstore(redstonePayload, newRedstoneLen)
            let oldMemorySize := mload(0x40)
            bytesRes := add(oldMemorySize, calldatasize())
            calldatacopy(oldMemorySize, 0x00, calldatasize())
            let success := staticcall(gas(), oracleContractAddress, add(redstonePayload, 0x20), newRedstoneLen, 0, 0)
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