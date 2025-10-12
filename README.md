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

### Update Vault Configuration

```typescript
import { VaultConfigField } from "@voltr/vault-sdk";

// Update max cap
const maxCapData = client.serializeU64(new BN(20_000_000_000_000));
const maxCapIx = await client.createUpdateVaultConfigIx(
  VaultConfigField.MaxCap,
  maxCapData,
  {
    vault: vaultPubkey,
    admin: adminPubkey,
  }
);

// Update withdrawal waiting period
const waitingPeriodData = client.serializeU64(new BN(5_000));
const waitingPeriodIx = await client.createUpdateVaultConfigIx(
  VaultConfigField.WithdrawalWaitingPeriod,
  waitingPeriodData,
  {
    vault: vaultPubkey,
    admin: adminPubkey,
  }
);

// Update manager management fee (requires LP mint)
const vaultLpMint = client.findVaultLpMint(vaultPubkey);
const feeData = client.serializeU16(1000); // 10%
const feeIx = await client.createUpdateVaultConfigIx(
  VaultConfigField.ManagerManagementFee,
  feeData,
  {
    vault: vaultPubkey,
    admin: adminPubkey,
    vaultLpMint: vaultLpMint,
  }
);

// Update issuance fee
const issuanceFeeData = client.serializeU16(75); // 0.75%
const issuanceFeeIx = await client.createUpdateVaultConfigIx(
  VaultConfigField.IssuanceFee,
  issuanceFeeData,
  {
    vault: vaultPubkey,
    admin: adminPubkey,
  }
);

// Update vault manager
const newManager = new PublicKey("...");
const managerData = client.serializePubkey(newManager);
const managerIx = await client.createUpdateVaultConfigIx(
  VaultConfigField.Manager,
  managerData,
  {
    vault: vaultPubkey,
    admin: adminPubkey,
  }
);
```

#### Available Vault Config Fields

- `VaultConfigField.MaxCap` - Maximum vault capacity (u64)
- `VaultConfigField.StartAtTs` - Vault start timestamp (u64)
- `VaultConfigField.LockedProfitDegradationDuration` - Locked profit degradation duration (u64)
- `VaultConfigField.WithdrawalWaitingPeriod` - Withdrawal waiting period (u64)
- `VaultConfigField.ManagerPerformanceFee` - Manager performance fee in BPS (u16)
- `VaultConfigField.AdminPerformanceFee` - Admin performance fee in BPS (u16)
- `VaultConfigField.ManagerManagementFee` - Manager management fee in BPS (u16, requires LP mint)
- `VaultConfigField.AdminManagementFee` - Admin management fee in BPS (u16, requires LP mint)
- `VaultConfigField.RedemptionFee` - Redemption fee in BPS (u16)
- `VaultConfigField.IssuanceFee` - Issuance fee in BPS (u16)
- `VaultConfigField.Manager` - Vault manager (PublicKey)

> **Note:** When updating `ManagerManagementFee` or `AdminManagementFee`, you must provide the `vaultLpMint` parameter as these operations charge management fees and require reading the LP mint supply.

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

// Get pending withdrawal for a specific user
const userWithdrawal = await client.getPendingWithdrawalForUser(
  vaultPubkey,
  userPubkey
);
console.log(`User withdrawal amount: ${userWithdrawal.amountAssetToWithdrawEffective}`);
```

### Fee Management

```typescript
// Calibrate high water mark (admin only)
const calibrateIx = await client.createCalibrateHighWaterMarkIx({
  vault: vaultPubkey,
  admin: adminPubkey,
});

// Get current high water mark
const highWaterMark = await client.getHighWaterMarkForVault(vaultPubkey);
console.log(`Highest asset per LP: ${highWaterMark.highestAssetPerLp}`);
console.log(
  `Last updated: ${new Date(highWaterMark.lastUpdatedTs * 1000).toLocaleString()}`
);

// Get current asset per LP
const currentAssetPerLp =
  await client.getCurrentAssetPerLpForVault(vaultPubkey);
console.log(`Current asset per LP: ${currentAssetPerLp}`);

// Harvest accumulated fees
const harvestIx = await client.createHarvestFeeIx({
  harvester: harvesterPubkey,
  vaultManager: managerPubkey,
  vaultAdmin: adminPubkey,
  protocolAdmin: protocolAdminPubkey,
  vault: vaultPubkey,
});

// Get accumulated fees
const adminFees = await client.getAccumulatedAdminFeesForVault(vaultPubkey);
const managerFees = await client.getAccumulatedManagerFeesForVault(vaultPubkey);
console.log(`Admin fees: ${adminFees.toString()}`);
console.log(`Manager fees: ${managerFees.toString()}`);
```

## Helper Methods

### Serialization Helpers

The SDK provides helper methods to serialize values for vault configuration updates:

```typescript
// Serialize u64 values (for amounts, timestamps, etc.)
const u64Data = client.serializeU64(new BN(20_000_000_000_000));

// Serialize u16 values (for fee percentages in basis points)
const u16Data = client.serializeU16(1000); // 10%

// Serialize PublicKey values (for manager updates)
const pubkeyData = client.serializePubkey(new PublicKey("..."));
```

## API Reference

### VoltrClient Methods

#### Vault Management

- `createInitializeVaultIx(vaultParams, params)` - Initialize a new vault
- `createUpdateVaultIx(vaultConfig, params)` - **Deprecated:** Update vault (use `createUpdateVaultConfigIx` instead)
- `createUpdateVaultConfigIx(field, data, params)` - Update a specific vault configuration field
- `createDepositVaultIx(amount, params)` - Deposit assets into vault
- `createRequestWithdrawVaultIx(requestWithdrawArgs, params)` - Request withdrawal from vault
- `createCancelRequestWithdrawVaultIx(params)` - Cancel a pending withdrawal request
- `createWithdrawVaultIx(params)` - Execute a withdrawal from vault
- `createHarvestFeeIx(params)` - Harvest accumulated fees
- `createCalibrateHighWaterMarkIx(params)` - Calibrate the high water mark
- `createCreateLpMetadataIx(createLpMetadataArgs, params)` - Create LP token metadata

#### Strategy Management

- `createAddAdaptorIx(params)` - Add an adaptor to a vault
- `createInitializeStrategyIx(initArgs, params)` - Initialize a new strategy
- `createDepositStrategyIx(depositArgs, params)` - Deposit assets into a strategy
- `createWithdrawStrategyIx(withdrawArgs, params)` - Withdraw assets from a strategy
- `createInitializeDirectWithdrawStrategyIx(initArgs, params)` - Initialize direct withdraw for a strategy
- `createDirectWithdrawStrategyIx(withdrawArgs, params)` - Execute direct withdrawal from a strategy
- `createCloseStrategyIx(params)` - Close a strategy
- `createRemoveAdaptorIx(params)` - Remove an adaptor from a vault

#### Account Data

- `fetchVaultAccount(vault)` - Fetch vault account data
- `fetchStrategyInitReceiptAccount(strategyInitReceipt)` - Fetch strategy initialization receipt
- `fetchAdaptorAddReceiptAccount(adaptorAddReceipt)` - Fetch adaptor add receipt
- `fetchRequestWithdrawVaultReceiptAccount(requestWithdrawVaultReceipt)` - Fetch withdrawal request receipt
- `fetchAllStrategyInitReceiptAccounts()` - Fetch all strategy receipts
- `fetchAllStrategyInitReceiptAccountsOfVault(vault)` - Fetch all strategy receipts for a vault
- `fetchAllAdaptorAddReceiptAccountsOfVault(vault)` - Fetch all adaptor receipts for a vault
- `fetchAllRequestWithdrawVaultReceiptsOfVault(vault)` - Fetch all withdrawal requests for a vault
- `getPositionAndTotalValuesForVault(vault)` - Get position values and total vault value
- `getAccumulatedAdminFeesForVault(vault)` - Get accumulated admin fees
- `getAccumulatedManagerFeesForVault(vault)` - Get accumulated manager fees
- `getPendingWithdrawalForUser(vault, user)` - Get pending withdrawal for a specific user
- `getAllPendingWithdrawalsForVault(vault)` - Get all pending withdrawals for a vault
- `getCurrentAssetPerLpForVault(vault)` - Get current asset per LP ratio
- `getHighWaterMarkForVault(vault)` - Get high water mark information

#### PDA Finding

- `findVaultLpMint(vault)` - Find vault LP mint address
- `findVaultAssetIdleAuth(vault)` - Find vault asset idle authority
- `findVaultAddresses(vault)` - Find all vault-related addresses
- `findVaultStrategyAuth(vault, strategy)` - Find vault strategy authority
- `findStrategyInitReceipt(vault, strategy)` - Find strategy initialization receipt
- `findDirectWithdrawInitReceipt(vault, strategy)` - Find direct withdraw receipt
- `findVaultStrategyAddresses(vault, strategy)` - Find all strategy-related addresses
- `findRequestWithdrawVaultReceipt(vault, user)` - Find withdrawal request receipt
- `findLpMetadataAccount(vault)` - Find LP metadata account

#### Calculations

- `calculateAssetsForWithdraw(vaultPk, lpAmount)` - Calculate asset amount for LP tokens
- `calculateLpForWithdraw(vaultPk, assetAmount)` - Calculate LP tokens needed for asset amount
- `calculateLpForDeposit(vaultPk, assetAmount)` - Calculate LP tokens received for deposit

#### Helper Methods

- `serializeU64(value)` - Serialize a u64 value to Buffer
- `serializeU16(value)` - Serialize a u16 value to Buffer
- `serializePubkey(pubkey)` - Serialize a PublicKey to Buffer
- `getBalance(publicKey)` - Get account balance in lamports

## License

[MIT](https://choosealicense.com/licenses/mit/)