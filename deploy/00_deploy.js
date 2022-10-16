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
  const pubKey = ethers.utils.arrayify(deployer.publicKey);
  const f1addr = fa.newSecp256k1Address(pubKey).toString();

  try {
    // check that an actor has been deployed at the deployer address
    await ethers.provider.send("Filecoin.StateLookupID", [f1addr, []]);
  } catch (e) {
    console.error(`failed to resolve address ${f1addr}. be sure to deploy an actor by sending FIL there`)
    return
  }

  const nonce = await ethers.provider.send("Filecoin.MpoolGetNonce", [f1addr]);
  const priorityFee = await ethers.provider.send("eth_maxPriorityFeePerGas", [])

  await deploy("SimpleCoin", {
    from: deployer.address,
    args: [],
    // since it's difficult to estimate the gas before f4 address is launched, it's safer to manually set
    // a large gasLimit. This should be addressed in the following releases.
    gasLimit: 1000000000, // BlockGasLimit / 10
    // since Ethereum's legacy transaction format is not supported on FVM, we need to specify
    // maxPriorityFeePerGas to instruct hardhat to use EIP-1559 tx format
    maxPriorityFeePerGas: priorityFee,
    nonce: nonce,
    log: true,
  });
};
module.exports.tags = ["SimpleCoin"];