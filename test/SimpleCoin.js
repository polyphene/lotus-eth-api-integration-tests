const { deployments, ethers } = require('hardhat')

let deployerF0Addr, deploymentTxHash, deploymentBlockHash, deploymentBlockNumber
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
      const {
        blockHash,
        blockNumber,
      } = txByHash
      deploymentBlockHash = blockHash
      deploymentBlockNumber = blockNumber
    })
  it('Should access transaction receipt after it has been mined',
    async function () {
      const txReceipt = await ethers.provider.getTransactionReceipt(
        deploymentTxHash)
      console.log({ txReceipt })
    })
  it('Should find the transaction in block tx list', async function () {
    const blockByHash = await ethers.provider.getBlock(deploymentBlockHash)
    console.log({ blockByHash })
    const blockByNumber = await ethers.provider.getBlock(deploymentBlockNumber)
    console.log({ blockByNumber })
  })
  it('Should get block tx count', async function () {
    const blockTxCountByHash = await ethers.provider.send(
      'eth_getBlockTransactionCountByHash', [deploymentBlockHash])
    console.log(blockTxCountByHash)
    const blockTxCountByNumber = await ethers.provider.send(
      'eth_getBlockTransactionCountByNumber',
      [ethers.utils.hexlify(deploymentBlockNumber)])
    console.log(blockTxCountByNumber)
  })
  it('Should interact with the contract using eth_call', async function () {
    const SimpleCoin = await ethers.getContract('SimpleCoin')
    const deployerBalance = await SimpleCoin.getBalance(deployerF0Addr)
    console.log({ deployerBalance })
    const receiverBalance = await SimpleCoin.getBalance(otherAddress)
    console.log({ receiverBalance })
  })
  it('Should get the contract byte code at the deployed address', async function () {
    const SimpleCoin = await ethers.getContract('SimpleCoin')
    const code = await ethers.provider.getCode(SimpleCoin.address, "latest");
    console.log({ code })
  })
  it('Should get storage using eth_getStorageAt', async function () {
    const SimpleCoin = await ethers.getContract('SimpleCoin')
    const key = ethers.utils.hexConcat([
      ethers.utils.hexZeroPad(deployerF0Addr, 32),
      ethers.utils.hexZeroPad('0x00', 32),
    ])
    const position = ethers.utils.keccak256(key)
    const storage = await ethers.provider.getStorageAt(SimpleCoin.address,
      position)
    console.log({ storage })
  })
})
