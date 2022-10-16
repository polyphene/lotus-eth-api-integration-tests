require('dotenv').config()
const { ethers } = require('hardhat')
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
const fa = require("@glif/filecoin-address");

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;

  // use the deployer private key to compute the Filecoin f1 deployer address
  // and get the right tx nonce
  const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY);
  const ethAddr = deployer.address
  const pubKey = ethers.utils.arrayify(deployer.publicKey);
  const f1Addr = fa.newSecp256k1Address(pubKey).toString();
  let f0Addr

  try {
    // check that an actor has been deployed at the deployer address
    let actorId = await ethers.provider.send("Filecoin.StateLookupID", [f1Addr, []]);
    // format the deployer f0 address
    actorId = ethers.utils.hexValue(Number(actorId.slice(1)))
    f0Addr =  ethers.utils.hexConcat(['0xff', ethers.utils.hexZeroPad(actorId, 19)])
  } catch (e) {
    console.error(`failed to resolve address ${f1Addr}. be sure to deploy an actor by sending FIL there`)
    return
  }

  const nonce = await ethers.provider.send("Filecoin.MpoolGetNonce", [f1Addr]);
  const priorityFee = await ethers.provider.send("eth_maxPriorityFeePerGas", [])

  await deploy("SimpleCoin", {
    from: ethAddr,
    args: [],
    // since Ethereum's legacy transaction format is not supported on FVM, we need to specify
    // maxPriorityFeePerGas to instruct hardhat to use EIP-1559 tx format
    maxPriorityFeePerGas: priorityFee,
    nonce: nonce,
    linkedData: {pubKey, ethAddr, f1Addr, f0Addr},
    log: true,
  });
};
module.exports.tags = ["SimpleCoin"];