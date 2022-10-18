require('dotenv').config()
const fa = require('@glif/filecoin-address')
const { promisify } = require('util')
const { ethers, web3 } = require('hardhat') // TODO remove ethers

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY

const getDeployerF1Address = () => {
  // use the deployer private key to compute the Filecoin f1 deployer address
  const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY)
  const pubKey = ethers.utils.arrayify(deployer.publicKey)
  return fa.newSecp256k1Address(pubKey).toString()
}

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
    const actorId = ethers.utils.hexValue(Number(result.slice(1)))
    return ethers.utils.hexConcat(
      ['0xff', ethers.utils.hexZeroPad(actorId, 19)])
  } catch (e) {
    console.error(
      `failed to resolve address ${f1Addr}. be sure to deploy an actor by sending FIL there`)
  }
}

module.exports = {
  getDeployerF1Address,
  getDeployerF0Address,
}