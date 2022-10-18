require('dotenv').config()
const fa = require('@glif/filecoin-address')
const { ethers } = require('hardhat')

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
    let actorId = await ethers.provider.send('Filecoin.StateLookupID',
      [f1Addr, []])
    // format the deployer f0 address
    actorId = ethers.utils.hexValue(Number(actorId.slice(1)))
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