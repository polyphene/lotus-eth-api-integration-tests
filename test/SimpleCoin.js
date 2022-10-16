const { deployments, ethers } = require('hardhat')

let deploymentTxHash
let deployerF0Addr
const otherAddress = '0xff000000000000000000000000000000deadbeef'

describe('SimpleCoin', function () {
  it('Should successfully deploy', async function () {
    await deployments.fixture(['SimpleCoin'])
    const { linkedData, transactionHash } = await deployments.get('SimpleCoin')
    deployerF0Addr = linkedData.f0Addr
    deploymentTxHash = transactionHash
  })
  it('Should access transaction details after it has been mined',
    async function () {
      const txByHash = await ethers.provider.getTransaction(deploymentTxHash)
      console.log({ txByHash })
    })
  it('Should access transaction receipt after it has been mined',
    async function () {
      const txReceipt = await ethers.provider.getTransactionReceipt(deploymentTxHash)
      console.log({ txReceipt })
    })
  it('Should interact with the contract using eth_call', async function () {
    const SimpleCoin = await ethers.getContract('SimpleCoin')
    const deployerBalance = await SimpleCoin.getBalance(deployerF0Addr)
    console.log({ deployerBalance })
    const receiverBalance = await SimpleCoin.getBalance(otherAddress)
    console.log({ receiverBalance })
  })
})
