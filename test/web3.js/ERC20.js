require('chai').should()
const deployContract = require('./utils/deployContract')
const { getDeployerF1Address } = require('../util/utils')
const { getDeployerF0Address } = require('./utils/getDeployerAddresses')

const TOKEN_NAME = 'my_token'
const TOKEN_SYMBOL = 'TKN'
const TOKEN_INITIAL_SUPPLY = 1000

let deployerF0Addr, erc20

describe('ERC20', function () {
  it('Should successfully deploy', async function () {
    const deployerF1Addr = getDeployerF1Address()
    deployerF0Addr = await getDeployerF0Address(deployerF1Addr)
    const { contract } = await deployContract('ERC20PresetFixedSupply',
      TOKEN_NAME, TOKEN_SYMBOL, TOKEN_INITIAL_SUPPLY, deployerF0Addr)

    erc20 = await contract
  })
  it('Should set the right name', async function () {
    const name = await erc20.methods.name().call()

    name.should.be.equal(TOKEN_NAME)
  })
  it('Should set the right symbol', async function () {
    const symbol = await erc20.methods.symbol().call()

    symbol.should.be.equal(TOKEN_SYMBOL)
  })
  it('Should set the right initial supply', async function () {
    const ownerBalance = Number(await erc20.methods.balanceOf(deployerF0Addr).call())

    ownerBalance.should.be.equal(TOKEN_INITIAL_SUPPLY)
  })
})
