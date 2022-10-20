const should = require('chai').should()

const testGetPendingTransactionByHash = (txByHash, deployerF0Addr) => {
  txByHash.should.contain.keys(
    'blockHash',
    'blockNumber',
    'from',
    'hash',
    'transactionIndex',
  )
  txByHash.from.should.be.a.properAddress
  txByHash.from.should.hexEqual(deployerF0Addr)
  should.not.exist(txByHash.blockHash)
  should.not.exist(txByHash.blockNumber)
  should.not.exist(txByHash.transactionIndex)
  should.not.exist(txByHash.to)
}

const testGetPendingTransactionReceipt = (txReceipt) => {
  // eth_getTransactionReceipt returns null for both pending and unknown transactions
  should.not.exist(txReceipt)
}

const testGetMinedTransactionByHash = (txByHash, deployerF0Addr) => {
  txByHash.should.contain.keys(
    'blockHash',
    'blockNumber',
    'from',
    'hash',
    'transactionIndex',
  )
  txByHash.from.should.be.a.properAddress
  txByHash.from.should.hexEqual(deployerF0Addr)
  should.not.exist(txByHash.to)
}

const testGetMinedTransactionReceipt = (txReceipt) => {
  txReceipt.should.contain.keys(
    'blockHash',
    'blockNumber',
    'from',
    'cumulativeGasUsed',
    'gasUsed',
    'logs',
    'logsBloom',
    'transactionHash',
    'transactionIndex',
    'effectiveGasPrice',
  )
  txReceipt.gasUsed.should.be.gt(0)
  txReceipt.cumulativeGasUsed.should.be.gte(txReceipt.gasUsed)
  txReceipt.status.should.equal(1)
}

const testGetBlock = (block, deploymentTxHash) => {
  block.should.contain.keys(
    'parentHash',
    'sha3Uncles',
    'miner',
    'stateRoot',
    'transactionsRoot',
    'receiptsRoot',
    'logsBloom',
    'number',
    'gasLimit',
    'gasUsed',
    'timestamp',
    'extraData',
    'mixHash',
    'nonce',
    'size',
    'transactions',
    'uncles',
  )
  block.gasUsed.should.be.gt(0)
  block.transactions.length.should.not.be.empty
  block.transactions.should.contain(deploymentTxHash)
}

const testGetBlockTxCount = (blockTxCount) => {
  Number(blockTxCount).should.be.gt(0)
}

const testCall = (deployerBalance, receiverBalance) => {
  deployerBalance.should.be.equal(10000)
  receiverBalance.should.be.equal(0)
}

const testGetCode = (code, expectedCode) => {
  code.should.be.equal(expectedCode)
}

const testGetStorageAt = (storageAtDeployerBalance, storageAtOtherBalance) => {
  storageAtDeployerBalance.should.be.equal('0x0000000000000000000000000000000000000000000000000000000000002710')
  storageAtOtherBalance.should.be.equal('0x0000000000000000000000000000000000000000000000000000000000000000')
}

module.exports = {
  testGetPendingTransactionByHash,
  testGetPendingTransactionReceipt,
  testGetMinedTransactionByHash,
  testGetMinedTransactionReceipt,
  testGetBlock,
  testGetBlockTxCount,
  testCall,
  testGetCode,
  testGetStorageAt,
}