const { deployments, ethers } = require('hardhat')

let deployerF0Addr
const otherAddress = '0xff000000000000000000000000000000deadbeef'

describe('SimpleCoin', function () {
  it('Should successfully deploy', async function () {
    await deployments.fixture(['SimpleCoin'])
    const { linkedData } = await deployments.get('SimpleCoin')
    deployerF0Addr = linkedData.f0Addr
  })
  it('Should interact with the contract using eth_call', async function () {
    const SimpleCoin = await ethers.getContract('SimpleCoin')
    const deployerBalance = await SimpleCoin.getBalance(deployerF0Addr)
    console.log({ deployerBalance })
    const receiverBalance = await SimpleCoin.getBalance(otherAddress)
    console.log({ receiverBalance })
  })
})
