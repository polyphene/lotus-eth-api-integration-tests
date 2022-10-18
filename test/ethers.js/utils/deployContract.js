const { ethers } = require('hardhat')
const { getDeployerF1Address } = require('../../util/utils')

const deployContract = async (contractName, ...args) => {
  const f1Addr = getDeployerF1Address()

  const maxPriorityFeePerGas = await ethers.provider.send(
    'eth_maxPriorityFeePerGas', [])
  const nonce = await ethers.provider.send('Filecoin.MpoolGetNonce',
    [f1Addr])

  // create a contract factory
  const Contract = await ethers.getContractFactory(contractName)
  // send a deployment transaction, without waiting for the transaction to be mined
  return await Contract.deploy(...args, {
    gasLimit: 1000000000,
    maxPriorityFeePerGas,
    nonce,
  })
}

module.exports = deployContract