# Voltr SDK

A TypeScript SDK for interacting with the Voltr protocol on Solana.

## Features

- Complete TypeScript support with type definitions
- Comprehensive vault management functionality
- Strategy handling and execution
- Asset deposit and withdrawal operations
- PDA (Program Derived Address) utilities
- Account data fetching and parsing

## Installation

```bash
npm install @voltr/vault-sdk
```

## Quick Start

```typescript
import { Connection } from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";

// Initialize client
const connection = new Connection("https://api.mainnet-beta.solana.com");
const client = new VoltrClient(connection);
```

## Usage Examples

### Initialize a New Vault

```typescript
import { BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";

// Create vault initialization parameters
const vaultParams = {
  config: {
    maxCap: new BN("1000000000"),
    startAtTs: new BN(Math.floor(Date.now() / 1000)),
    managerManagementFee: 50, // 0.5%
    managerPerformanceFee: 1000, // 10%
    adminManagementFee: 50, // 0.5%
    adminPerformanceFee: 1000, // 10%
  },
  name: "My Vault",
  description: "Example vault",
};

// Create initialization instruction
const ix = await client.createInitializeVaultIx(vaultParams, {
  vault: vaultKeypair,
  vaultAssetMint: new PublicKey("..."),
  admin: adminPubkey,
  manager: managerPubkey,
  payer: payerPubkey,
});
```

### Deposit Assets

```typescript
const depositIx = await client.createDepositIx(new BN("1000000000"), {
  userAuthority: userPubkey,
  vault: vaultPubkey,
  vaultAssetMint: mintPubkey,
  assetTokenProgram: tokenProgramPubkey,
});
```

### Withdraw Assets

```typescript
const withdrawIx = await client.createWithdrawIx(new BN("1000000000"), {
  userAuthority: userPubkey,
  vault: vaultPubkey,
  vaultAssetMint: mintPubkey,
  assetTokenProgram: tokenProgramPubkey,
});
```

### Strategy Management

```typescript
// Add an adaptor to a vault
const addAdaptorIx = await client.createAddAdaptorIx({
  vault: vaultPubkey,
  payer: payerPubkey,
  adaptorProgram: adaptorProgramPubkey,
});

// Initialize a strategy
const initStrategyIx = await client.createInitializeStrategyIx(
  {
    instructionDiscriminator: null,
    additionalArgs: null,
  },
  {
    payer: payerPubkey,
    vault: vaultPubkey,
    manager: managerPubkey,
    strategy: strategyPubkey,
    adaptorProgram: adaptorProgramPubkey,
  }
);

// Deposit into a strategy
const depositStrategyIx = await client.createDepositStrategyIx(
  {
    depositAmount: new BN("1000000000"),
    instructionDiscriminator: null,
    additionalArgs: null,
  },
  {
    vault: vaultPubkey,
    vaultAssetMint: mintPubkey,
    strategy: strategyPubkey,
    assetTokenProgram: tokenProgramPubkey,
    adaptorProgram: adaptorProgramPubkey,
    remainingAccounts: [],
  }
);
```

## API Reference

### VoltrClient

The main client class for interacting with the Voltr protocol.

#### Constructor

```typescript
constructor(conn: Connection, wallet?: Keypair)
```

#### Vault Management Methods

- `createInitializeVaultIx(vaultParams: VaultParams, params: InitializeParams)`
- `createDepositIx(amount: BN, params: DepositParams)`
- `createWithdrawIx(amount: BN, params: WithdrawParams)`

#### Strategy Management Methods

- `createAddAdaptorIx(params: AddAdaptorParams)`
- `createInitializeStrategyIx(initArgs: InitializeStrategyArgs, params: InitStrategyParams)`
- `createDepositStrategyIx(depositArgs: depositStrategyArgs, params: DepositStrategyParams)`
- `createWithdrawStrategyIx(withdrawArgs: withdrawStrategyArgs, params: WithdrawStrategyParams)`
- `createRemoveStrategyIx(params: RemoveStrategyParams)`

#### Account Fetching Methods

- `fetchVaultAccount(vault: PublicKey)`
- `fetchAllStrategyInitReceiptAccounts()`
- `fetchAllStrategyInitReceiptAccountsOfVault(vault: PublicKey)`
- `fetchAllAdaptorAddReceiptAccountsOfVault(vault: PublicKey)`
- `getPositionAndTotalValuesForVault(vault: PublicKey)`

#### PDA Finding Methods

- `findVaultLpMint(vault: PublicKey)`
- `findVaultAssetIdleAuth(vault: PublicKey)`
- `findVaultLpFeeAuth(vault: PublicKey)`
- `findVaultAddresses(vault: PublicKey)`
- `findVaultStrategyAuth(vault: PublicKey, strategy: PublicKey)`
- `findStrategyInitReceipt(vault: PublicKey, strategy: PublicKey)`

#### Calculation Methods

- `calculateAssetsForWithdraw(vaultPk: PublicKey, lpAmount: BN)`
- `calculateLpTokensForDeposit(depositAmount: BN, vaultPk: PublicKey)`

## License

[MIT](https://choosealicense.com/licenses/mit/)
