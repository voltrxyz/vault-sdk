# Voltr SDK

A TypeScript SDK for interacting with the Voltr protocol on Solana.

## Features

- Complete TypeScript support with type definitions
- Comprehensive vault management functionality
- Strategy handling and execution with adaptor support
- Asset deposit and withdrawal operations with direct withdraw capability
- Account data fetching and PDA (Program Derived Address) utilities
- Position and total value tracking

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

### Strategy Management

```typescript
// Add an adaptor to a vault
const addAdaptorIx = await client.createAddAdaptorIx({
  vault: vaultPubkey,
  payer: payerPubkey,
  admin: adminPubkey,
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
    remainingAccounts: [],
  }
);

// Initialize direct withdraw strategy
const initDirectWithdrawIx =
  await client.createInitializeDirectWithdrawStrategyIx(
    {
      instructionDiscriminator: null,
      additionalArgs: null,
      allowUserArgs: true,
    },
    {
      payer: payerPubkey,
      admin: adminPubkey,
      vault: vaultPubkey,
      strategy: strategyPubkey,
      adaptorProgram: adaptorProgramPubkey,
    }
  );
```

### Asset Operations

```typescript
// Deposit assets
const depositIx = await client.createDepositIx(new BN("1000000000"), {
  userAuthority: userPubkey,
  vault: vaultPubkey,
  vaultAssetMint: mintPubkey,
  assetTokenProgram: tokenProgramPubkey,
});

// Withdraw assets
const withdrawIx = await client.createWithdrawIx(new BN("1000000000"), {
  userAuthority: userPubkey,
  vault: vaultPubkey,
  vaultAssetMint: mintPubkey,
  assetTokenProgram: tokenProgramPubkey,
});

// Direct withdraw from strategy
const directWithdrawIx = await client.createDirectWithdrawStrategyIx(
  {
    withdrawAmount: new BN("1000000000"),
    userArgs: null,
  },
  {
    user: userPubkey,
    vault: vaultPubkey,
    strategy: strategyPubkey,
    vaultAssetMint: mintPubkey,
    assetTokenProgram: tokenProgramPubkey,
    adaptorProgram: adaptorProgramPubkey,
    remainingAccounts: [],
  }
);
```

### Position and Value Tracking

```typescript
// Get position and total values for a vault
const values = await client.getPositionAndTotalValuesForVault(vaultPubkey);
console.log(`Total Value: ${values.totalValue}`);
console.log("Strategy Positions:", values.strategies);
```

## API Reference

### VoltrClient Methods

#### Vault Management

- `createInitializeVaultIx(vaultParams, params)`
- `createDepositIx(amount, params)`
- `createWithdrawIx(amount, params)`

#### Strategy Management

- `createAddAdaptorIx(params)`
- `createInitializeStrategyIx(initArgs, params)`
- `createDepositStrategyIx(depositArgs, params)`
- `createWithdrawStrategyIx(withdrawArgs, params)`
- `createInitializeDirectWithdrawStrategyIx(initArgs, params)`
- `createDirectWithdrawStrategyIx(withdrawArgs, params)`
- `createRemoveAdaptorIx(params)`

#### Account Data

- `fetchVaultAccount(vault)`
- `fetchAllStrategyInitReceiptAccounts()`
- `fetchAllStrategyInitReceiptAccountsOfVault(vault)`
- `fetchAllAdaptorAddReceiptAccountsOfVault(vault)`
- `getPositionAndTotalValuesForVault(vault)`

#### PDA Finding

- `findVaultLpMint(vault)`
- `findVaultAssetIdleAuth(vault)`
- `findVaultAddresses(vault)`
- `findVaultStrategyAuth(vault, strategy)`
- `findStrategyInitReceipt(vault, strategy)`
- `findDirectWithdrawInitReceipt(vault, strategy)`

#### Calculations

- `calculateAssetsForWithdraw(vaultPk, lpAmount)`
- `calculateLpTokensForDeposit(depositAmount, vaultPk)`

## License

[MIT](https://choosealicense.com/licenses/mit/)
