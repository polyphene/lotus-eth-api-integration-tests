const { ethers } = require('hardhat')
const { getDeployerF1Address, isFilecoinNetwork } = require('../../util/utils')

const deployContract = async (contractName, ...args) => {
  const isFilecoin = await isFilecoinNetwork()

  let options
  if (isFilecoin) {
    const f1Addr = getDeployerF1Address()
    const nonce = await ethers.provider.send('Filecoin.MpoolGetNonce',
      [f1Addr])
    const maxPriorityFeePerGas = await ethers.provider.send(
      'eth_maxPriorityFeePerGas', [])
    options = { nonce, maxPriorityFeePerGas, gasLimit: 1000000000 }
  } else {
    const [ethDeployer] = await ethers.getSigners()
    const nonce = await ethers.provider.getTransactionCount(ethDeployer.address)
    options = { nonce }
  }

  // create a contract factory
  const Contract = await ethers.getContractFactory(contractName)
  // send a deployment transaction, without waiting for the transaction to be mined
  return await Contract.deploy(...args, options)
}

module.exports = deployContract