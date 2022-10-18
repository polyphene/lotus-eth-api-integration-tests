require('dotenv').config()
const { artifacts, ethers } = require('hardhat')
const deployContract = require('./utils/deployContract')
const { getDeployerF1Address, getDeployerF0Address } = require(
  './utils/getDeployerAddresses')
const rpcTests = require('../util/testRpcResponses')
const should = require('chai').should()

let deployerF0Addr, deploymentTxHash, deploymentBlockHash,
  deploymentBlockNumber, simpleCoinAddress
const otherAddress = '0xff000000000000000000000000000000deadbeef'

describe('SimpleCoin', function () {
  it('Should send deployment transaction', async function () {
    const simpleCoin = await deployContract('SimpleCoin')

    deploymentTxHash = simpleCoin.deployTransaction.hash

    const f1Addr = getDeployerF1Address()
    deployerF0Addr = await getDeployerF0Address(f1Addr)
  })
  it('Should access transaction details before it has been mined',
    async function () {
      const txByHash = await ethers.provider.getTransaction(deploymentTxHash)

      txByHash.should.contain.keys(
        'blockHash',
        'blockNumber',
        'from',
        'hash',
        'transactionIndex',
      )
      txByHash.from.should.be.a.properAddress
      txByHash.from.should.hexEqual(deployerF0Addr)
      should.not.exist(txByHash.blockHash)
      should.not.exist(txByHash.blockNumber)
      should.not.exist(txByHash.transactionIndex)
      should.not.exist(txByHash.to)
    })
  it('Should access null transaction receipt before it has been mined',
    async function () {
      const txReceipt = await ethers.provider.getTransactionReceipt(
        deploymentTxHash)

      // eth_getTransactionReceipt returns null for both pending and unknown transactions
      should.not.exist(txReceipt)
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

      rpcTests.testGetTransactionByHash(txByHash, deployerF0Addr)
    })
  it('Should access transaction receipt after it has been mined',
    async function () {
      const txReceipt = await ethers.provider.getTransactionReceipt(
        deploymentTxHash)
      simpleCoinAddress = txReceipt.contractAddress

      rpcTests.testGetTransactionReceipt(txReceipt)
    })
  it('Should find the transaction in block tx list', async function () {
    const blockByHash = await ethers.provider.getBlock(deploymentBlockHash)
    const blockByNumber = await ethers.provider.getBlock(deploymentBlockNumber);

    [blockByHash, blockByNumber].forEach(b => {rpcTests.testGetBlock(b, deploymentTxHash)})
    blockByHash.should.deep.equal(blockByNumber)
  })
  it('Should get block tx count', async function () {
    const blockTxCountByHash = await ethers.provider.send(
      'eth_getBlockTransactionCountByHash', [deploymentBlockHash])
    const blockTxCountByNumber = await ethers.provider.send(
      'eth_getBlockTransactionCountByNumber',
      [ethers.utils.hexlify(deploymentBlockNumber)]);

    [blockTxCountByHash, blockTxCountByNumber].forEach(rpcTests.testGetBlockTxCount)
    blockTxCountByHash.should.be.equal(blockTxCountByNumber)
  })
  it('Should interact with the contract using eth_call', async function () {
    const SimpleCoin = await ethers.getContractAt('SimpleCoin',
      simpleCoinAddress)
    const deployerBalance = await SimpleCoin.getBalance(deployerF0Addr)
    const receiverBalance = await SimpleCoin.getBalance(otherAddress)

    rpcTests.testCall(deployerBalance, receiverBalance)
  })
  it('Should get the contract byte code at the deployed address',
    async function () {
      const SimpleCoin = await ethers.getContractAt('SimpleCoin',
        simpleCoinAddress)
      const code = await ethers.provider.getCode(SimpleCoin.address, 'latest')
      const { deployedBytecode } = await artifacts.readArtifact('SimpleCoin')

      code.should.be.equal(deployedBytecode)
    })
  it('Should get storage using eth_getStorageAt', async function () {
    const SimpleCoin = await ethers.getContractAt('SimpleCoin',
      simpleCoinAddress)

    let key = ethers.utils.hexConcat([
      ethers.utils.hexZeroPad(deployerF0Addr, 32),
      ethers.utils.hexZeroPad('0x00', 32),
    ])
    let position = ethers.utils.keccak256(key)
    const storageAtDeployerBalance = await ethers.provider.getStorageAt(
      SimpleCoin.address,
      position)

    storageAtDeployerBalance.should.be.equal(10000)

    key = ethers.utils.hexConcat([
      ethers.utils.hexZeroPad(otherAddress, 32),
      ethers.utils.hexZeroPad('0x00', 32),
    ])
    position = ethers.utils.keccak256(key)
    const storageAtOtherBalance = await ethers.provider.getStorageAt(
      SimpleCoin.address,
      position)

    storageAtOtherBalance.should.be.equal(0)
  })
})
