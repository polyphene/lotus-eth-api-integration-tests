require('dotenv').config()
const fa = require('@glif/filecoin-address')
const { ethers } = require('hardhat')
const { utils, BigNumber, Wallet } = require('hardhat').ethers

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY

const isFilecoinNetwork = async () => {
  try {
    await ethers.provider.send('Filecoin.Version', [])
    return true
  } catch (e) {
    return false
  }
}

const getDeployerF1Address = () => {
  // use the deployer private key to compute the Filecoin f1 deployer address
  const deployer = new Wallet(DEPLOYER_PRIVATE_KEY)
  const pubKey = utils.arrayify(deployer.publicKey)
  return fa.newSecp256k1Address(pubKey).toString()
}

const actorIdToF0Address = (actorIdStr) => {
  const actorId = utils.hexValue(Number(actorIdStr.slice(1)))
  return utils.hexConcat(
    ['0xff', utils.hexZeroPad(actorId, 19)])
}

const mappingStoragePositionFromKey = (mapPosition, mapKey) => {
  let key = utils.hexConcat([
    utils.hexZeroPad(mapKey, 32),
    utils.hexZeroPad(BigNumber.from(mapPosition).toHexString(), 32),
  ])
  return utils.keccak256(key)
}

module.exports = {
  isFilecoinNetwork,
  getDeployerF1Address,
  actorIdToF0Address,
  mappingStoragePositionFromKey,
}