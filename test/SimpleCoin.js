const { deployments } = require('hardhat')

let deployerF0Addr

describe('SimpleCoin', function () {
  it('Should successfully deploy', async function () {
    await deployments.fixture(['SimpleCoin'])
    const { linkedData } = await deployments.get('SimpleCoin')
    deployerF0Addr = linkedData.f0Addr
  })
})
