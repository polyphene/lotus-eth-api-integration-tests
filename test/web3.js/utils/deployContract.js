const { artifacts, web3 } = require('hardhat')
const { promisify } = require('util')
const { getDeployerF1Address, isFilecoinNetwork } = require('../../util/utils')

const sendRpcRequest = async (method, params) => {
  return (await promisify(web3.currentProvider.send)({
    method,
    params,
    jsonrpc: '2.0',
    id: new Date().getTime(),
  })).result
}

const deployContract = async (contractName, ...args) => {
  const isFilecoin = await isFilecoinNetwork()

  let options
  const from = (await web3.eth.getAccounts())[0]
  if (isFilecoin) {
    const f1Addr = getDeployerF1Address()
    const nonce = await sendRpcRequest('Filecoin.MpoolGetNonce', [f1Addr])
    const maxPriorityFeePerGas = await sendRpcRequest('eth_maxPriorityFeePerGas.MpoolGetNonce', [])
    options = { from, nonce, maxPriorityFeePerGas, gasLimit: 1000000000 }
  } else {
    const nonce = await sendRpcRequest('Filecoin.MpoolGetNonce', [from])
    options = { from, nonce }
  }

  const { abi, bytecode } = await artifacts.readArtifact(contractName)
  const Contract = new web3.eth.Contract(abi)
  // send a deployment transaction, without waiting for the transaction to be mined
  return new Promise(function (resolve) {
    const contract = Contract.deploy({ data: bytecode, arguments: args })
    .send(options)
    .on('transactionHash', (txHash) => {
      resolve({ contract, txHash })
    })
  })
}

module.exports = deployContract