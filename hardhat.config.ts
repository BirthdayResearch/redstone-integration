import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-foundry";
import "@nomicfoundation/hardhat-ledger";

require("dotenv").config({
  path: ".env"
})

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  paths: {
    sources: "contracts/"
  },
  networks: {
    DMCTestnet: {
      url: process.env.DMC_TESTNET_URL || '', 
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [], 
      chainId: 1131
    }, 
    DMCMainnet: {
      url: process.env.DMC_MAINNET_URL || '', 
      // ledgerAccounts: ['first EVM address of your ledger']
      // chainId: 
    }
  }, 
  etherscan: {
    apiKey: {
      DMCTestnet: 'abc', 
      // DMCMainnet: 'abc'
    }, 
    customChains: [
      {
        network: 'DMCTestnet', 
        chainId: 1131, 
        urls: {
          apiURL: 'https://blockscout.testnet.ocean.jellyfishsdk.com/api', 
          browserURL: 'https://meta.defiscan.live/?network=TestNet'
        }
      }, 
      // {
      //   network: 'DMCMainnet', 
      //   chainId: 
      //   urls : {
      //     apiURL: blockscout URL, 
      //     browserURL: browserURL
      //  }
      // }
    ]
  }
};

export default config;
