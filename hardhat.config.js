require('dotenv').config()
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-web3')
require('@nomicfoundation/hardhat-chai-matchers')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.15',
  defaultNetwork: 'lotus-local-net',
  networks: {
    'lotus-local-net': {
      url: 'http://localhost:1234/rpc/v0',
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
    'wallaby': {
      url: 'https://wallaby.node.glif.io/rpc/v0',
      httpHeaders: {
        'Content-Type': 'application/json',
      },
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
    hardhat: {
      mining: {
        auto: false,
        interval: 1000,
      },
      accounts: [
        {
          privateKey: process.env.DEPLOYER_PRIVATE_KEY,
          balance: "1000000000000000000",
        }],
    },
  },
}
