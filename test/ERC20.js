require('dotenv').config()
const { ethers } = require('hardhat')
const deployContract = require('./utils/deployContract')
const { getDeployerF1Address, getDeployerF0Address } = require(
  './utils/getDeployerAddresses')
require('chai').should()

const TOKEN_NAME = 'my_token'
const TOKEN_SYMBOL = 'TKN'
const TOKEN_INITIAL_SUPPLY = 1000

let deployerF0Addr, deploymentTxHash, erc20Address

describe('ERC20', function () {
  it('Should successfully deploy', async function () {
    const f1Addr = getDeployerF1Address()
    deployerF0Addr = await getDeployerF0Address(f1Addr)

    const erc20 = await deployContract('ERC20PresetFixedSupply',
      TOKEN_NAME, TOKEN_SYMBOL, TOKEN_INITIAL_SUPPLY, deployerF0Addr)

    deploymentTxHash = erc20.deployTransaction.hash

    await erc20.deployed()
  })
  it('Should access deployment transaction receipt',
    async function () {
      const txReceipt = await ethers.provider.getTransactionReceipt(
        deploymentTxHash)
      erc20Address = txReceipt.contractAddress
    })
  it('Should set the right name', async function () {
    const ERC20 = await ethers.getContractAt('ERC20PresetFixedSupply',
      erc20Address)
    const name = await ERC20.name()

    name.should.be.equal(TOKEN_NAME)
  })
  it('Should set the right symbol', async function () {
    const ERC20 = await ethers.getContractAt('ERC20PresetFixedSupply',
      erc20Address)
    const symbol = await ERC20.symbol()

    symbol.should.be.equal(TOKEN_SYMBOL)
  })
  it('Should set the right initial supply', async function () {
    const ERC20 = await ethers.getContractAt('ERC20PresetFixedSupply',
      erc20Address)
    const ownerBalance = await ERC20.balanceOf(deployerF0Addr)

    ownerBalance.should.be.equal(TOKEN_INITIAL_SUPPLY)
  })
})
