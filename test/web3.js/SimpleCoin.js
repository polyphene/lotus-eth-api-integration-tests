require('dotenv').config()
const { getDeployerF1Address, getDeployerF0Address } = require(
  './utils/getDeployerAddresses')
const deployContract = require('./utils/deployContract')
const { web3 } = require('hardhat')
const { promisify } = require('util')
const rpcTests = require('../util/testRpcResponses')

let deployerF0Addr, deploymentTxHash, simpleCoin, deploymentBlockHash,
  deploymentBlockNumber, simpleCoinAddress
const otherAddress = '0xff000000000000000000000000000000deadbeef'

describe('SimpleCoin', function () {
  it('Should send deployment transaction', async function () {
    const { contract, txHash } = await deployContract('SimpleCoin')

    simpleCoin = contract
    deploymentTxHash = txHash

    const f1Addr = getDeployerF1Address()
    deployerF0Addr = await getDeployerF0Address(f1Addr)
  })
  it('Should successfully deploy', async function () {
    await pendingContract
  })
  it('Should access transaction details after it has been mined',
    async function () {
      const txByHash = await promisify(web3.eth.getTransaction)(
        deploymentTxHash)

      const {
        blockHash,
        blockNumber,
      } = txByHash
      deploymentBlockHash = blockHash
      deploymentBlockNumber = blockNumber

      rpcTests.testGetTransactionByHash(txByHash, deployerF0Addr)
    })
  it('Should access transaction receipt after it has been mined',
    async function () {
      const txReceipt = await promisify(web3.eth.getTransactionReceipt)(
        deploymentTxHash)
      simpleCoinAddress = txReceipt.contractAddress

      rpcTests.testGetTransactionReceipt(txReceipt)
    })
  it('Should find the transaction in block tx list', async function () {
    const blockByHash = await promisify(web3.eth.getBlock)(
      deploymentBlockHash)
    const blockByNumber = await promisify(web3.eth.getBlock)(
      deploymentBlockNumber);

    [blockByHash, blockByNumber].forEach(b => {rpcTests.testGetBlock(b, deploymentTxHash)})
    blockByHash.should.deep.equal(blockByNumber)
  })
  it('Should get block tx count', async function () {
    const blockTxCountByHash = await promisify(web3.eth.getBlockTransactionCount)(
      deploymentBlockHash)
    const blockTxCountByNumber = await promisify(web3.eth.getBlockTransactionCount)(
      deploymentBlockNumber);

    [blockTxCountByHash, blockTxCountByNumber].forEach(rpcTests.testGetBlockTxCount)
    blockTxCountByHash.should.be.equal(blockTxCountByNumber)
  })
  it('Should interact with the contract using eth_call', async function () {
    const deployerBalance = Number(await simpleCoin.methods.getBalance(deployerF0Addr).call())
    const receiverBalance = Number(await simpleCoin.methods.getBalance(otherAddress).call())

    rpcTests.testCall(deployerBalance, receiverBalance)
  })
})
