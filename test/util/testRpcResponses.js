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

module.exports = { testGetTransactionByHash, testGetTransactionReceipt }