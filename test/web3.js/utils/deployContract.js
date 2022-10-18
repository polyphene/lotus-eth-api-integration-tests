const { artifacts, web3 } = require('hardhat')
const { promisify } = require('util')
const { getDeployerF1Address } = require('../../util/utils')

const deployContract = async (contractName, ...args) => {
  const f1Addr = getDeployerF1Address()

  const from = (await web3.eth.getAccounts())[0]
  const maxPriorityFeePerGas = (await promisify(web3.currentProvider.send)({
    method: 'eth_maxPriorityFeePerGas',
    params: [],
    jsonrpc: '2.0',
    id: new Date().getTime(),
  })).result
  const nonce = (await promisify(web3.currentProvider.send)({
    method: 'Filecoin.MpoolGetNonce',
    params: [f1Addr],
    jsonrpc: '2.0',
    id: new Date().getTime(),
  })).result

  const { abi, bytecode } = await artifacts.readArtifact(contractName)
  const Contract = new web3.eth.Contract(abi)
  // send a deployment transaction, without waiting for the transaction to be mined
  return new Promise(function (resolve) {
    const contract = Contract.deploy({ data: bytecode, arguments: args }).send({
      from,
      gasLimit: 1000000000,
      maxPriorityFeePerGas,
      nonce,
    }).on('transactionHash', (txHash) => {
      resolve({ contract, txHash })
    })
  })
}

module.exports = deployContract