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

module.exports = { testGetTransactionByHash }