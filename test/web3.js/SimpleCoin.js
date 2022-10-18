require('dotenv').config()
const { getDeployerF1Address, getDeployerF0Address } = require(
  './utils/getDeployerAddresses')
const deployContract = require('./utils/deployContract')

let deployerF0Addr, deploymentTxHash, pendingContract

describe('SimpleCoin', function () {
  it('Should send deployment transaction', async function () {
    const { contract, txHash } = await deployContract('SimpleCoin')

    pendingContract = contract
    deploymentTxHash = txHash

    const f1Addr = getDeployerF1Address()
    deployerF0Addr = await getDeployerF0Address(f1Addr)
  })
  it('Should successfully deploy', async function () {
    await pendingContract
  })
})
