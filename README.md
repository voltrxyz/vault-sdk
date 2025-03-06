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
    lockedProfitDegradationDuration: new BN(3600), // 1 hour
    managerManagementFee: 50, // 0.5%
    managerPerformanceFee: 1000, // 10%
    adminManagementFee: 50, // 0.5%
    adminPerformanceFee: 1000, // 10%
    redemptionFee: 10, // 0.1%
    issuanceFee: 10, // 0.1%
    withdrawalWaitingPeriod: new BN(3600), // 1 hour
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
const depositIx = await client.createDepositVaultIx(new BN("1000000000"), {
  userTransferAuthority: userPubkey,
  vault: vaultPubkey,
  vaultAssetMint: mintPubkey,
  assetTokenProgram: tokenProgramPubkey,
});

// Request withdraw assets
const requestWithdrawIx = await client.createRequestWithdrawVaultIx(
  {
    amount: new BN("1000000000"),
    isAmountInLp: false,
    isWithdrawAll: false,
  },
  {
    payer: payerPubkey,
    userTransferAuthority: userPubkey,
    vault: vaultPubkey,
  }
);

// Cancel withdraw request
const cancelRequestWithdrawIx = await client.createCancelRequestWithdrawVaultIx(
  {
    userTransferAuthority: userPubkey,
    vault: vaultPubkey,
  }
);

// Withdraw from vault
const withdrawIx = await client.createWithdrawVaultIx({
  userTransferAuthority: userPubkey,
  vault: vaultPubkey,
  vaultAssetMint: mintPubkey,
  assetTokenProgram: tokenProgramPubkey,
});

// Direct withdraw from strategy
const directWithdrawIx = await client.createDirectWithdrawStrategyIx(
  {
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

### Asset Calculation Utilities

```typescript
// Calculate the amount of assets that would be received for a given LP token amount
const assetsToReceive = await client.calculateAssetsForWithdraw(
  vaultPubkey,
  new BN("1000000000")
);
console.log(`Assets to receive: ${assetsToReceive.toString()}`);

// Calculate the amount of LP tokens needed to withdraw a specific asset amount
const lpTokensRequired = await client.calculateLpForWithdraw(
  vaultPubkey,
  new BN("1000000000")
);
console.log(`LP tokens required: ${lpTokensRequired.toString()}`);

// Calculate the amount of LP tokens that would be received for a deposit
const lpTokensToReceive = await client.calculateLpForDeposit(
  vaultPubkey,
  new BN("1000000000")
);
console.log(`LP tokens to receive: ${lpTokensToReceive.toString()}`);
```

### Querying Pending Withdrawals

```typescript
// Get all pending withdrawals for a vault
const pendingWithdrawals = await client.getAllPendingWithdrawalsForVault(
  vaultPubkey
);

// Process the pending withdrawals
pendingWithdrawals.forEach((withdrawal, index) => {
  console.log(`Withdrawal ${index + 1}:`);
  console.log(`  Asset amount: ${withdrawal.amountAssetToWithdraw}`);

  // Check if withdrawal is available yet
  const withdrawableTimestamp = withdrawal.withdrawableFromTs.toNumber();
  const currentTime = Math.floor(Date.now() / 1000);
  const isWithdrawable = currentTime >= withdrawableTimestamp;

  console.log(
    `  Withdrawable from: ${new Date(
      withdrawableTimestamp * 1000
    ).toLocaleString()}`
  );
  console.log(`  Status: ${isWithdrawable ? "Available now" : "Pending"}`);
  if (!isWithdrawable) {
    const timeRemaining = Math.max(0, withdrawableTimestamp - currentTime);
    console.log(
      `  Time remaining: ${Math.floor(timeRemaining / 3600)}h ${Math.floor(
        (timeRemaining % 3600) / 60
      )}m`
    );
  }
});
```

## API Reference

### VoltrClient Methods

#### Vault Management

- `createInitializeVaultIx(vaultParams, params)`
- `createUpdateVaultIx(vaultConfig, params)`
- `createRequestWithdrawVaultIx(requestWithdrawArgs, params)`
- `createCancelRequestWithdrawVaultIx(params)`
- `createWithdrawVaultIx(params)`

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
- `calculateLpForWithdraw(vaultPk, assetAmount)`
- `calculateLpForDeposit(vaultPk, assetAmount)`

## License

[MIT](https://choosealicense.com/licenses/mit/)
