const should = require('chai').should()

const testGetTransactionByHash = (txByHash, deployerF0Addr) => {
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

const testGetTransactionReceipt = (txReceipt) => {
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
  txReceipt.cumulativeGasUsed.should.be.gt(txReceipt.gasUsed)
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

module.exports = { testGetTransactionByHash, testGetTransactionReceipt, testGetBlock }