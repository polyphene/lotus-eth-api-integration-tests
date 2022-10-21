require('dotenv').config()
const { artifacts, ethers } = require('hardhat')
const deployContract = require('./utils/deployContract')
const { getDeployerAddress } = require('./utils/getDeployerAddresses')
const rpcTests = require('../util/testRpcResponses')
const { mappingStoragePositionFromKey } = require(
  '../util/utils')

let deployerAddr, deploymentTxHash, deploymentBlockHash,
  deploymentBlockNumber, simpleCoinAddress
const otherAddress = "0xb1C4ae9955eF3BDF24b029808e01Abb5B8bb12BE";

describe('SimpleCoin', function () {
  it('Should send deployment transaction', async function () {
    const simpleCoin = await deployContract('SimpleCoin')

    deploymentTxHash = simpleCoin.deployTransaction.hash

    deployerAddr = await getDeployerAddress()
  })
  it('Should access transaction details before it has been mined',
    async function () {
      const txByHash = await ethers.provider.getTransaction(deploymentTxHash)

      rpcTests.testGetPendingTransactionByHash(txByHash, deployerAddr)
    })
  it('Should access null transaction receipt before it has been mined',
    async function () {
      const txReceipt = await ethers.provider.getTransactionReceipt(
        deploymentTxHash)

      rpcTests.testGetPendingTransactionReceipt(txReceipt)
    })
  it('Should successfully deploy', async function () {
    const tx = await ethers.provider.getTransaction(deploymentTxHash)
    await tx.wait()
  })
  it('Should access transaction details after it has been mined',
    async function () {
      const txByHash = await ethers.provider.getTransaction(deploymentTxHash)

      const {
        blockHash,
        blockNumber,
      } = txByHash
      deploymentBlockHash = blockHash
      deploymentBlockNumber = blockNumber

      rpcTests.testGetMinedTransactionByHash(txByHash, deployerAddr)
    })
  it('Should access transaction receipt after it has been mined',
    async function () {
      const txReceipt = await ethers.provider.getTransactionReceipt(
        deploymentTxHash)
      simpleCoinAddress = txReceipt.contractAddress

      rpcTests.testGetMinedTransactionReceipt(txReceipt, false)
    })
  it('Should find the transaction in block tx list', async function () {
    const blockByHash = await ethers.provider.getBlock(deploymentBlockHash)
    const blockByNumber = await ethers.provider.getBlock(deploymentBlockNumber);

    [blockByHash, blockByNumber].forEach(
      b => {rpcTests.testGetBlock(b, deploymentTxHash)})
    blockByHash.should.deep.equal(blockByNumber)
  })
  it('Should get block tx count', async function () {
    const blockTxCountByHash = await ethers.provider.send(
      'eth_getBlockTransactionCountByHash', [deploymentBlockHash])
    const hexBlockNumber = ethers.utils.hexValue(
      ethers.BigNumber.from(deploymentBlockNumber))
    const blockTxCountByNumber = await ethers.provider.send(
      'eth_getBlockTransactionCountByNumber',
      [hexBlockNumber]);

    [blockTxCountByHash, blockTxCountByNumber].forEach(
      rpcTests.testGetBlockTxCount)
    blockTxCountByHash.should.be.equal(blockTxCountByNumber)
  })
  it('Should interact with the contract using eth_call', async function () {
    const SimpleCoin = await ethers.getContractAt('SimpleCoin',
      simpleCoinAddress)
    const deployerBalance = await SimpleCoin.getBalance(deployerAddr)
    const receiverBalance = await SimpleCoin.getBalance(otherAddress)

    rpcTests.testCall(deployerBalance, receiverBalance)
  })
  it('Should get the contract byte code at the deployed address',
    async function () {
      const SimpleCoin = await ethers.getContractAt('SimpleCoin',
        simpleCoinAddress)
      const code = await ethers.provider.getCode(SimpleCoin.address, 'latest')
      const { deployedBytecode } = await artifacts.readArtifact('SimpleCoin')

      rpcTests.testGetCode(code, deployedBytecode)
    })
  it('Should get storage using eth_getStorageAt', async function () {
    const SimpleCoin = await ethers.getContractAt('SimpleCoin',
      simpleCoinAddress)

    let position = mappingStoragePositionFromKey(0, deployerAddr)
    const storageAtDeployerBalance = await ethers.provider.getStorageAt(
      SimpleCoin.address,
      position)

    position = mappingStoragePositionFromKey(0, otherAddress)
    const storageAtOtherBalance = await ethers.provider.getStorageAt(
      SimpleCoin.address,
      position)

    rpcTests.testGetStorageAt(storageAtDeployerBalance, storageAtOtherBalance)
  })
})
