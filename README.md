# Lotus Eth JSON-RPC integration tests

This project holds a suite of integration tests for the Ethereum JSON-RPC API
built in Lotus with the Filecoin EVM runtime.

It takes advantage of the [hardhat](https://hardhat.org) framework.

## Running

By default, the test suite will run locally, expecting a local Lotus network
and the Ethereum JSON RPC to be accessible on http://localhost:1234/rpc/v0 .

A private key should be set in an `.env` file, and an actor should have been deployed at the related address.
Sending some FIL there is enough.

Once properly initialized, you may take full advantage of the power of hardhat
with the few following commands.

Compile smart contracts:

```shell
npx hardhat compile
```

And run the test suites:

```shell
npx hardhat test
```

## Contributing

This project follows the default structure of a `hardhat` project,
basically made of:

    hardhat.config.js the hardhat configuration file.
    contracts/ where the sources of smart contracts should be.
    test/ where test scripts should go.

## License

Dual-licensed: [MIT](./LICENSE-MIT), [Apache Software License v2](./LICENSE-APACHE), by way of the
[Permissive License Stack](https://protocol.ai/blog/announcing-the-permissive-license-stack/).
