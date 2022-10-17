require('dotenv').config()
const fa = require("@glif/filecoin-address");
const { artifacts, ethers } = require('hardhat')
const should = require('chai').should()

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
let deployerF0Addr, deploymentTxHash, deploymentBlockHash, deploymentBlockNumber, simpleCoinAddress
const otherAddress = '0xff000000000000000000000000000000deadbeef'

describe('SimpleCoin', function () {
  it('Should successfully deploy', async function () {
    // use the deployer private key to compute the Filecoin f1 deployer address
    // and get the right tx nonce
    const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY);
    const pubKey = ethers.utils.arrayify(deployer.publicKey);
    const f1Addr = fa.newSecp256k1Address(pubKey).toString();

    try {
      // check that an actor has been deployed at the deployer address
      let actorId = await ethers.provider.send("Filecoin.StateLookupID", [f1Addr, []]);
      // format the deployer f0 address
      actorId = ethers.utils.hexValue(Number(actorId.slice(1)))
      deployerF0Addr =  ethers.utils.hexConcat(['0xff', ethers.utils.hexZeroPad(actorId, 19)])
    } catch (e) {
      console.error(`failed to resolve address ${f1Addr}. be sure to deploy an actor by sending FIL there`)
      return
    }

    const maxPriorityFeePerGas = await ethers.provider.send("eth_maxPriorityFeePerGas", [])
    const nonce = await ethers.provider.send("Filecoin.MpoolGetNonce", [f1Addr]);

    const SimpleCoin = await ethers.getContractFactory("SimpleCoin");
    const simpleCoin = await SimpleCoin.deploy( {
      gasLimit: 1000000000,
      maxPriorityFeePerGas,
      nonce,
    });

    deploymentTxHash = simpleCoin.deployTransaction.hash
    await simpleCoin.deployed();
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

      txByHash.should.contain.keys(
        'blockHash',
        'blockNumber',
        'from',
        'hash',
        'transactionIndex',
      )
      txByHash.from.should.be.a.properAddress
      txByHash.from.should.hexEqual(deployerF0Addr)
      should.not.exist(txByHash.to)
    })
  it('Should access transaction receipt after it has been mined',
    async function () {
      const txReceipt = await ethers.provider.getTransactionReceipt(
        deploymentTxHash)
      simpleCoinAddress = txReceipt.contractAddress

      txReceipt.should.contain.keys(
        'blockHash',
        'blockNumber',
        'from',
        'cumulativeGasUsed',
        'gasUsed',
        'logs',
        'logsBloom',
        'transactionHash',
        'transactionIndex',
        'effectiveGasPrice',
      )
      txReceipt.gasUsed.should.be.gt(0)
      txReceipt.cumulativeGasUsed.should.be.gt(txReceipt.gasUsed)
      txReceipt.status.should.equal(1)
    })
  it('Should find the transaction in block tx list', async function () {
    const blockByHash = await ethers.provider.getBlock(deploymentBlockHash)
    const blockByNumber = await ethers.provider.getBlock(deploymentBlockNumber);

    [blockByHash, blockByNumber].forEach(bloc => {
      bloc.should.contain.keys(
        'parentHash',
        'sha3Uncles',
        'miner',
        'stateRoot',
        'transactionsRoot',
        'receiptsRoot',
        'logsBloom',
        'number',
        'gasLimit',
        'gasUsed',
        'timestamp',
        'extraData',
        'mixHash',
        'nonce',
        'size',
        'transactions',
        'uncles',
      )
      bloc.gasUsed.should.be.gt(0)
      bloc.transactions.length.should.not.be.empty
      bloc.transactions.should.contain(deploymentTxHash)
    })

    blockByHash.should.deep.equal(blockByNumber)
  })
  it('Should get block tx count', async function () {
    const blockTxCountByHash = await ethers.provider.send(
      'eth_getBlockTransactionCountByHash', [deploymentBlockHash])
    const blockTxCountByNumber = await ethers.provider.send(
      'eth_getBlockTransactionCountByNumber',
      [ethers.utils.hexlify(deploymentBlockNumber)]);

    [blockTxCountByHash, blockTxCountByNumber].forEach(blockTxCount => {
      Number(blockTxCount).should.be.gt(0)
    })

    blockTxCountByHash.should.be.equal(blockTxCountByNumber)
  })
  it('Should interact with the contract using eth_call', async function () {
    const SimpleCoin = await ethers.getContractAt('SimpleCoin', simpleCoinAddress)
    const deployerBalance = await SimpleCoin.getBalance(deployerF0Addr)
    const receiverBalance = await SimpleCoin.getBalance(otherAddress)

    deployerBalance.should.be.equal(10000)
    receiverBalance.should.be.equal(0)
  })
  it('Should get the contract byte code at the deployed address',
    async function () {
      const SimpleCoin = await ethers.getContractAt('SimpleCoin', simpleCoinAddress)
      const code = await ethers.provider.getCode(SimpleCoin.address, "latest");
      const { deployedBytecode } = await artifacts.readArtifact("SimpleCoin")

      code.should.be.equal(deployedBytecode)
    })
  it('Should get storage using eth_getStorageAt', async function () {
    const SimpleCoin = await ethers.getContractAt('SimpleCoin', simpleCoinAddress)

    let key = ethers.utils.hexConcat([
      ethers.utils.hexZeroPad(deployerF0Addr, 32),
      ethers.utils.hexZeroPad('0x00', 32),
    ])
    let position = ethers.utils.keccak256(key)
    const storageAtDeployerBalance = await ethers.provider.getStorageAt(SimpleCoin.address,
      position)

    storageAtDeployerBalance.should.be.equal(10000)

    key = ethers.utils.hexConcat([
      ethers.utils.hexZeroPad(otherAddress, 32),
      ethers.utils.hexZeroPad('0x00', 32),
    ])
    position = ethers.utils.keccak256(key)
    const storageAtOtherBalance = await ethers.provider.getStorageAt(SimpleCoin.address,
      position)

    storageAtOtherBalance.should.be.equal(0)
  })
})
