const { promisify } = require('util')
const { web3 } = require('hardhat')
const { actorIdToF0Address } = require('../../util/utils')

const getDeployerF0Address = async (f1Addr) => {
  try {
    // check that an actor has been deployed at the deployer address
    let resp = await promisify(web3.currentProvider.send)({
      method: 'Filecoin.StateLookupID',
      params: [f1Addr, []],
      jsonrpc: '2.0',
      id: new Date().getTime(),
    })
    const { result } = resp
    // format the deployer f0 address
    return actorIdToF0Address(result)
  } catch (e) {
    console.error(
      `failed to resolve address ${f1Addr}. be sure to deploy an actor by sending FIL there`)
  }
}

module.exports = {
  getDeployerF0Address,
}