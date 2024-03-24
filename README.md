# Ballot.sol interactions
- Encode Solidity Bootcamp


## Get started - Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

## Core scripts

Cast vote
```bash
npx ts-node --files scripts/CastVote.ts <ballot.sol contract address> <index of proposal>
```

Delegate vote
```bash
npx ts-node --files scripts/DelegateVote.ts <ballot.sol contract address> <delegatee address>
```

Query Results
```bash
npx ts-node --files scripts/QueryResults.ts <ballot.sol contract address>
```

Give vote rights to a new address
```bash
npx ts-node --files scripts/GiveVoteRights.ts <ballot.sol contract address> <to future voter address>
```