import "./RedstoneOracle.sol";
import "./PriceOracleConsumer.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OracleConsumer is PriceOracleConsumer, Ownable {
    mapping(address => bytes32) public tokenToDataFeedId;
    RedstoneOracle oracleContract;
    event SWAP_WITH_PRICE(uint256[] price);

    constructor(address[] memory tokenAddresses, bytes32[] memory dataFeedIds, address _oracleContract) Ownable() {
        for (uint i = 0; i < tokenAddresses.length; i++) {
            tokenToDataFeedId[tokenAddresses[i]] = dataFeedIds[i];
        }
        oracleContract = RedstoneOracle(_oracleContract);
    }

    function mockSwap(address firstToken, address secondToken) public returns(bool) {
        address[] memory dummyAddreses = new address[](2);
        dummyAddreses[0] = address(1);
        dummyAddreses[1] = address(2);
        address[] memory tokenAddresses = new address[](1);
        tokenAddresses[0] = firstToken;
        uint256[] memory prices = getPricesForTokenAddresses(tokenAddresses);
        emit SWAP_WITH_PRICE(prices);
        return true;
    }

    function getPricesForTokenAddresses(address[] memory _tokenAddresses) public view returns (uint256[] memory) 
    {
        bytes32[] memory dataFeedIds = new bytes32[](_tokenAddresses.length);
        for (uint i = 0; i < _tokenAddresses.length; i++) {
            dataFeedIds[i] = tokenToDataFeedId[_tokenAddresses[i]];
        }
        address oracleContractAddress = address(oracleContract);        
        return getPricesForDataFeedsFromOracle(dataFeedIds, oracleContractAddress);

    } 
}