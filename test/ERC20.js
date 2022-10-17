require('dotenv').config()
const fa = require('@glif/filecoin-address')
const { ethers } = require('hardhat')
require('chai').should()

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY

const TOKEN_NAME = 'my_token'
const TOKEN_SYMBOL = 'TKN'
const TOKEN_INITIAL_SUPPLY = 1000

let deployerF0Addr, deploymentTxHash, erc20Address

describe('ERC20', function () {
  it('Should successfully deploy', async function () {
    // use the deployer private key to compute the Filecoin f1 deployer address
    // and get the right tx nonce
    const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY)
    const pubKey = ethers.utils.arrayify(deployer.publicKey)
    const f1Addr = fa.newSecp256k1Address(pubKey).toString()

    try {
      // check that an actor has been deployed at the deployer address
      let actorId = await ethers.provider.send('Filecoin.StateLookupID',
        [f1Addr, []])
      // format the deployer f0 address
      actorId = ethers.utils.hexValue(Number(actorId.slice(1)))
      deployerF0Addr = ethers.utils.hexConcat(
        ['0xff', ethers.utils.hexZeroPad(actorId, 19)])
    } catch (e) {
      console.error(
        `failed to resolve address ${f1Addr}. be sure to deploy an actor by sending FIL there`)
      return
    }

    const maxPriorityFeePerGas = await ethers.provider.send(
      'eth_maxPriorityFeePerGas', [])
    const nonce = await ethers.provider.send('Filecoin.MpoolGetNonce',
      [f1Addr])

    const ERC20 = await ethers.getContractFactory('ERC20PresetFixedSupply')
    const erc20 = await ERC20.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_INITIAL_SUPPLY,
      deployerF0Addr,
      {
        gasLimit: 1000000000,
        maxPriorityFeePerGas,
        nonce,
      })
    deploymentTxHash = erc20.deployTransaction.hash
    await erc20.deployed()
  })
  it('Should access deployment transaction receipt',
    async function () {
      const txReceipt = await ethers.provider.getTransactionReceipt(
        deploymentTxHash)
      erc20Address = txReceipt.contractAddress
    })
  it("Should set the right name", async function () {
    const ERC20 = await ethers.getContractAt('ERC20PresetFixedSupply',
      erc20Address)
    const name = await ERC20.name()

    name.should.be.equal(TOKEN_NAME)
  });
  it("Should set the right symbol", async function () {
    const ERC20 = await ethers.getContractAt('ERC20PresetFixedSupply',
      erc20Address)
    const symbol = await ERC20.symbol()

    symbol.should.be.equal(TOKEN_SYMBOL)
  });
  it("Should set the right initial supply", async function () {
    const ERC20 = await ethers.getContractAt('ERC20PresetFixedSupply',
      erc20Address)
    const ownerBalance = await ERC20.balanceOf(deployerF0Addr)

    ownerBalance.should.be.equal(TOKEN_INITIAL_SUPPLY)
  });
})
