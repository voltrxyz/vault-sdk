import {
  Program,
  AnchorProvider,
  Idl,
  setProvider,
  Wallet,
} from "@coral-xyz/anchor";
import BN from "bn.js";
import {
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { getMint, getAssociatedTokenAddressSync } from "@solana/spl-token";

import {
  LENDING_ADAPTOR_PROGRAM_ID,
  MAX_FEE_BPS_BN,
  METADATA_PROGRAM_ID,
  ONE_YEAR_BN,
  SEEDS,
} from "./constants";
import {
  VaultParams,
  VaultConfig,
  VoltrVault,
  InitializeStrategyArgs,
  DepositStrategyArgs,
  WithdrawStrategyArgs,
  InitializeDirectWithdrawStrategyArgs,
  RequestWithdrawVaultArgs,
  VaultConfigField,
} from "./types";

// Import IDL files
import * as vaultIdl from "./idl/voltr_vault.json";
import { convertDecimalBitsToDecimal } from "./decimals";

class CustomWallet implements Wallet {
  constructor(readonly payer: Keypair) {}

  async signTransaction(tx: any) {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: any[]) {
    return txs.map((t) => {
      t.partialSign(this.payer);
      return t;
    });
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}

class AccountUtils {
  conn: Connection;

  constructor(conn: Connection) {
    this.conn = conn;
  }

  /**
   * Gets the balance of a Solana account
   * @param publicKey - Public key to check balance for
   * @returns Promise resolving to the account balance in lamports
   * @throws {Error} If fetching balance fails
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      return await this.conn.getBalance(publicKey);
    } catch (error) {
      throw new Error(`Failed to get account balance: ${error}`);
    }
  }
}

/**
 * Main client for interacting with the Voltr protocol
 *
 * @remarks
 * The VoltrClient provides methods for initializing and managing vaults,
 * handling strategies, and performing deposits/withdrawals. It requires
 * a Solana connection and optionally accepts a wallet for signing transactions.
 *
 * @example
 * ```typescript
 * import { VoltrClient } from '@voltr/vault-sdk';
 * import { Connection } from '@solana/web3.js';
 *
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const client = new VoltrClient(connection);
 * ```
 */
export class VoltrClient extends AccountUtils {
  provider!: AnchorProvider;
  vaultProgram!: Program<VoltrVault>;
  vaultIdl!: Idl;

  /**
   * Creates a new VoltrClient instance
   * @param conn - Solana connection instance
   * @param wallet - Optional keypair for signing transactions
   */
  constructor(conn: Connection, wallet?: Keypair, opts?: ConfirmOptions) {
    super(conn);

    // Initialize programs
    this.setProvider(wallet, opts);
    this.setPrograms(vaultIdl as any);
  }

  private setProvider(wallet?: Keypair, opts?: ConfirmOptions) {
    /// we are creating instructions with this client without signing
    let kp: Keypair;
    if (!wallet) {
      const leakedKp = Keypair.fromSecretKey(
        Uint8Array.from([
          208, 175, 150, 242, 88, 34, 108, 88, 177, 16, 168, 75, 115, 181, 199,
          242, 120, 4, 78, 75, 19, 227, 13, 215, 184, 108, 226, 53, 111, 149,
          179, 84, 137, 121, 79, 1, 160, 223, 124, 241, 202, 203, 220, 237, 50,
          242, 57, 158, 226, 207, 203, 188, 43, 28, 70, 110, 214, 234, 251, 15,
          249, 157, 62, 80,
        ])
      );
      kp = leakedKp;
    } else {
      kp = wallet;
    }

    this.provider = new AnchorProvider(
      this.conn,
      new CustomWallet(kp),
      opts ?? AnchorProvider.defaultOptions()
    );
    setProvider(this.provider);
  }

  private setPrograms(vaultIdl?: Idl) {
    this.vaultProgram = new Program<VoltrVault>(vaultIdl as any, this.provider);
  }

  // --------------------------------------- Find PDA addresses

  /**
   * Finds the vault LP mint address for a given vault
   * @param vault - Public key of the vault
   * @returns The PDA for the vault's LP mint
   */
  findVaultLpMint(vault: PublicKey) {
    const [vaultLpMint] = PublicKey.findProgramAddressSync(
      [SEEDS.VAULT_LP_MINT, vault.toBuffer()],
      this.vaultProgram.programId
    );
    return vaultLpMint;
  }

  /**
   * Finds the vault's asset idle authority address
   * @param vault - Public key of the vault
   * @returns The PDA for the vault's asset idle authority
   */
  findVaultAssetIdleAuth(vault: PublicKey) {
    const [vaultAssetIdleAuth] = PublicKey.findProgramAddressSync(
      [SEEDS.VAULT_ASSET_IDLE_AUTH, vault.toBuffer()],
      this.vaultProgram.programId
    );
    return vaultAssetIdleAuth;
  }

  /**
   * Finds all vault-related addresses
   * @param vault - Public key of the vault
   * @returns Object containing all vault-related PDAs
   *
   * @example
   * ```typescript
   * const addresses = client.findVaultAddresses(vaultPubkey);
   * console.log(addresses.vaultLpMint.toBase58());
   * console.log(addresses.vaultAssetIdleAuth.toBase58());
   * console.log(addresses.vaultLpFeeAuth.toBase58());
   * ```
   */
  findVaultAddresses(vault: PublicKey) {
    const vaultLpMint = this.findVaultLpMint(vault);
    const vaultAssetIdleAuth = this.findVaultAssetIdleAuth(vault);

    return {
      vaultLpMint,
      vaultAssetIdleAuth,
    };
  }

  /**
   * Finds the vault strategy auth address
   * @param vault - Public key of the vault
   * @param strategy - Public key of the strategy
   * @returns The PDA for the vault strategy auth
   *
   * @example
   * ```typescript
   * const vaultStrategyAuth = client.findVaultStrategyAuth(vaultPubkey, strategyPubkey);
   * ```
   */
  findVaultStrategyAuth(vault: PublicKey, strategy: PublicKey) {
    const [vaultStrategyAuth] = PublicKey.findProgramAddressSync(
      [SEEDS.VAULT_STRATEGY_AUTH, vault.toBuffer(), strategy.toBuffer()],
      this.vaultProgram.programId
    );
    return vaultStrategyAuth;
  }

  /**
   * Finds the strategy init receipt address
   * @param vault - Public key of the vault
   * @param strategy - Public key of the strategy
   * @returns The PDA for the strategy init receipt
   *
   * @example
   * ```typescript
   * const strategyInitReceipt = client.findStrategyInitReceipt(vaultPubkey, strategyPubkey);
   * ```
   */
  findStrategyInitReceipt(vault: PublicKey, strategy: PublicKey) {
    const [strategyInitReceipt] = PublicKey.findProgramAddressSync(
      [SEEDS.STRATEGY_INIT_RECEIPT, vault.toBuffer(), strategy.toBuffer()],
      this.vaultProgram.programId
    );
    return strategyInitReceipt;
  }

  /**
   * Finds the direct withdraw init receipt address
   * @param vault - Public key of the vault
   * @param strategy - Public key of the strategy
   * @returns The PDA for the direct withdraw init receipt
   *
   * @example
   * ```typescript
   * const directWithdrawInitReceipt = client.findDirectWithdrawInitReceipt(vaultPubkey, strategyPubkey);
   * ```
   */
  findDirectWithdrawInitReceipt(vault: PublicKey, strategy: PublicKey) {
    const [directWithdrawInitReceipt] = PublicKey.findProgramAddressSync(
      [
        SEEDS.DIRECT_WITHDRAW_INIT_RECEIPT_SEED,
        vault.toBuffer(),
        strategy.toBuffer(),
      ],
      this.vaultProgram.programId
    );
    return directWithdrawInitReceipt;
  }

  findVaultStrategyAddresses(vault: PublicKey, strategy: PublicKey) {
    const vaultStrategyAuth = this.findVaultStrategyAuth(vault, strategy);
    const strategyInitReceipt = this.findStrategyInitReceipt(vault, strategy);
    const directWithdrawInitReceipt = this.findDirectWithdrawInitReceipt(
      vault,
      strategy
    );

    return {
      vaultStrategyAuth,
      strategyInitReceipt,
      directWithdrawInitReceipt,
    };
  }

  /**
   * Finds the request withdraw vault receipt address
   * @param vault - Public key of the vault
   * @param user - Public key of the user
   * @returns The PDA for the request withdraw vault receipt
   *
   * @example
   * ```typescript
   * const requestWithdrawVaultReceipt = client.findRequestWithdrawVaultReceipt(vaultPubkey, userPubkey);
   * ```
   */
  findRequestWithdrawVaultReceipt(vault: PublicKey, user: PublicKey) {
    const [requestWithdrawVaultReceipt] = PublicKey.findProgramAddressSync(
      [SEEDS.REQUEST_WITHDRAW_VAULT_RECEIPT, vault.toBuffer(), user.toBuffer()],
      this.vaultProgram.programId
    );

    return requestWithdrawVaultReceipt;
  }

  /**
   * Finds the LP metadata account for a given vault
   * @param vault - Public key of the vault
   * @returns The PDA for the LP metadata account
   *
   * @example
   * ```typescript
   * const lpMetadataAccount = client.findLpMetadataAccount(vaultPubkey);
   * ```
   */
  findLpMetadataAccount(vault: PublicKey) {
    const lpMint = this.findVaultLpMint(vault);
    const [lpMetadataAccount] = PublicKey.findProgramAddressSync(
      [SEEDS.METADATA, METADATA_PROGRAM_ID.toBuffer(), lpMint.toBuffer()],
      METADATA_PROGRAM_ID
    );
    return lpMetadataAccount;
  }

  // --------------------------------------- Vault Instructions
  /**
   * Creates an instruction to initialize a new vault
   *
   * @param {VaultParams} vaultParams - Configuration parameters for the vault
   * @param {VaultConfig} vaultParams.config - Vault configuration settings
   * @param {BN} vaultParams.config.maxCap - Maximum capacity of the vault
   * @param {BN} vaultParams.config.startAtTs - Vault start timestamp in seconds
   * @param {BN} vaultParams.config.lockedProfitDegradationDuration - Locked profit degradation duration in seconds
   * @param {number} vaultParams.config.managerManagementFee - Manager's management fee in basis points (e.g., 50 = 0.5%)
   * @param {number} vaultParams.config.managerPerformanceFee - Manager's performance fee in basis points (e.g., 1000 = 10%)
   * @param {number} vaultParams.config.adminManagementFee - Admin's management fee in basis points (e.g., 50 = 0.5%)
   * @param {number} vaultParams.config.adminPerformanceFee - Admin's performance fee in basis points (e.g., 1000 = 10%)
   * @param {number} vaultParams.config.redemptionFee - Redemption fee in basis points (e.g., 10 = 0.1%)
   * @param {number} vaultParams.config.issuanceFee - Issuance fee in basis points (e.g., 10 = 0.1%)
   * @param {BN} vaultParams.config.withdrawalWaitingPeriod - Withdrawal waiting period in seconds
   * @param {string} vaultParams.name - Name of the vault
   * @param {string} vaultParams.description - Description of the vault
   * @param {Object} params - Additional parameters for initializing the vault
   * @param {Keypair} params.vault - Keypair for the new vault
   * @param {PublicKey} params.vaultAssetMint - Public key of the vault's asset mint
   * @param {PublicKey} params.admin - Public key of the vault admin
   * @param {PublicKey} params.manager - Public key of the vault manager
   * @param {PublicKey} params.payer - Public key of the fee payer
   * @returns {Promise<TransactionInstruction>} Transaction instruction for initializing the vault
   *
   * @example
   * ```typescript
   * const ix = await client.createInitializeVaultIx(
   *   {
   *     config: {
   *       maxCap: new BN('1000000000'),
   *       startAtTs: new BN(Math.floor(Date.now() / 1000)),
   *       lockedProfitDegradationDuration: new BN(3600), // 1 hour
   *       redemptionFee: 10,
   *       issuanceFee: 10,
   *       withdrawalWaitingPeriod: new BN(3600), // 1 hour
   *       managerManagementFee: 50,  // 0.5%
   *       managerPerformanceFee: 1000,  // 10%
   *       adminManagementFee: 50,  // 0.5%
   *       adminPerformanceFee: 1000,  // 10%
   *     },
   *     name: "My Vault",
   *     description: "Example vault"
   *   },
   *   {
   *     vault: vaultKeypair,
   *     vaultAssetMint: new PublicKey('...'),
   *     admin: adminPubkey,
   *     manager: managerPubkey,
   *     payer: payerPubkey
   *   }
   * );
   * ```
   */
  async createInitializeVaultIx(
    vaultParams: VaultParams,
    {
      vault,
      vaultAssetMint,
      admin,
      manager,
      payer,
    }: {
      vault: PublicKey;
      vaultAssetMint: PublicKey;
      admin: PublicKey;
      manager: PublicKey;
      payer: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    const addresses = this.findVaultAddresses(vault);

    const vaultAssetIdleAta = getAssociatedTokenAddressSync(
      vaultAssetMint,
      addresses.vaultAssetIdleAuth,
      true
    );

    const vaultAssetMintAccount = await this.provider.connection.getAccountInfo(
      vaultAssetMint
    );
    const assetTokenProgram = vaultAssetMintAccount?.owner;

    if (!assetTokenProgram) {
      throw new Error("Vault asset mint not found");
    }

    return await this.vaultProgram.methods
      .initializeVault(
        vaultParams.config,
        vaultParams.name,
        vaultParams.description
      )
      .accounts({
        payer,
        admin,
        manager,
        vault,
        vaultAssetMint,
        vaultAssetIdleAta,
        assetTokenProgram,
      })
      .instruction();
  }

  /**
   * Creates an instruction to update a vault
   *
   * @deprecated Since version 1.0.14. Use `createUpdateVaultConfigIx` instead for more granular configuration updates.
   * This method will be removed in a future version.
   *
   * @param {VaultConfig} vaultConfig - Configuration parameters for the vault
   * @param {BN} vaultConfig.maxCap - Maximum capacity of the vault
   * @param {BN} vaultConfig.startAtTs - Vault start timestamp in seconds
   * @param {number} vaultConfig.managerManagementFee - Manager's management fee in basis points (e.g., 50 = 0.5%)
   * @param {number} vaultConfig.managerPerformanceFee - Manager's performance fee in basis points (e.g., 1000 = 10%)
   * @param {number} vaultConfig.adminManagementFee - Admin's management fee in basis points (e.g., 50 = 0.5%)
   * @param {number} vaultConfig.adminPerformanceFee - Admin's performance fee in basis points (e.g., 1000 = 10%)
   * @param {Object} params - Parameters for updating the vault
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.admin - Public key of the vault admin
   * @returns Transaction instruction for updating the vault
   *
   * @example
   * ```typescript
   * // DEPRECATED - Use createUpdateVaultConfigIx instead
   * const ix = await client.createUpdateVaultIx(
   *   {
   *     maxCap: new BN('1000000000'),
   *     startAtTs: new BN(Math.floor(Date.now() / 1000)),
   *     managerManagementFee: 50,
   *     managerPerformanceFee: 1000,
   *     adminManagementFee: 50,
   *     adminPerformanceFee: 1000,
   *   },
   *   { vault: vaultPubkey, admin: adminPubkey }
   * );
   *
   * // NEW WAY - Update individual fields:
   * const newMaxCap = new BN('1000000000');
   * const data = newMaxCap.toArrayLike(Buffer, 'le', 8);
   * const ix = await client.createUpdateVaultConfigIx(
   *   VaultConfigField.MaxCap,
   *   data,
   *   { vault: vaultPubkey, admin: adminPubkey }
   * );
   * ```
   */
  async createUpdateVaultIx(
    vaultConfig: VaultConfig,
    {
      vault,
      admin,
    }: {
      vault: PublicKey;
      admin: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    const lpMint = this.findVaultLpMint(vault);
    return await this.vaultProgram.methods
      .updateVault(vaultConfig)
      .accountsPartial({
        admin,
        vault,
      })
      .remainingAccounts([
        { pubkey: lpMint, isSigner: false, isWritable: false },
      ])
      .instruction();
  }

  /**
   * Creates an instruction to update a specific vault configuration field
   *
   * @param {VaultConfigField} field - The configuration field to update
   * @param {Buffer} data - The serialized data for the new value
   * @param {Object} params - Parameters for updating the vault config
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.admin - Public key of the vault admin
   * @param {PublicKey} [params.vaultLpMint] - Required when updating management fees
   * @returns {Promise<TransactionInstruction>} Transaction instruction for updating the vault config
   *
   * @throws {Error} If the field requires LP mint but it's not provided
   *
   * @example Update max cap
   * ```typescript
   * const newMaxCap = new BN(20_000_000_000_000);
   * const data = newMaxCap.toArrayLike(Buffer, "le", 8);
   *
   * const ix = await client.createUpdateVaultConfigIx(
   *   VaultConfigField.MaxCap,
   *   data,
   *   {
   *     vault: vaultPubkey,
   *     admin: adminPubkey
   *   }
   * );
   * ```
   *
   * @example Update manager management fee (requires LP mint)
   * ```typescript
   * const newManagerManagementFee = 1000; // 10%
   * const data = Buffer.alloc(2);
   * data.writeUInt16LE(newManagerManagementFee, 0);
   *
   * const vaultLpMint = client.findVaultLpMint(vaultPubkey);
   *
   * const ix = await client.createUpdateVaultConfigIx(
   *   VaultConfigField.ManagerManagementFee,
   *   data,
   *   {
   *     vault: vaultPubkey,
   *     admin: adminPubkey,
   *     vaultLpMint: vaultLpMint
   *   }
   * );
   * ```
   *
   * @example Update manager (requires Pubkey)
   * ```typescript
   * const newManager = new PublicKey('...');
   * const data = newManager.toBuffer();
   *
   * const ix = await client.createUpdateVaultConfigIx(
   *   VaultConfigField.Manager,
   *   data,
   *   {
   *     vault: vaultPubkey,
   *     admin: adminPubkey
   *   }
   * );
   * ```
   */
  async createUpdateVaultConfigIx(
    field: VaultConfigField,
    data: Buffer,
    {
      vault,
      admin,
      vaultLpMint,
    }: {
      vault: PublicKey;
      admin: PublicKey;
      vaultLpMint?: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    // Check if LP mint is required for this field
    const requiresLpMint =
      field === VaultConfigField.ManagerManagementFee ||
      field === VaultConfigField.AdminManagementFee;

    if (requiresLpMint && !vaultLpMint) {
      throw new Error(
        `LP mint is required when updating ${field}. Please provide vaultLpMint parameter.`
      );
    }

    // Build remaining accounts array
    const remainingAccounts = [];
    if (requiresLpMint && vaultLpMint) {
      remainingAccounts.push({
        pubkey: vaultLpMint,
        isSigner: false,
        isWritable: false,
      });
    }

    const fieldToVariant = {
      [VaultConfigField.MaxCap]: { maxCap: {} },
      [VaultConfigField.StartAtTs]: { startAtTs: {} },
      [VaultConfigField.LockedProfitDegradationDuration]: {
        lockedProfitDegradationDuration: {},
      },
      [VaultConfigField.WithdrawalWaitingPeriod]: {
        withdrawalWaitingPeriod: {},
      },
      [VaultConfigField.ManagerPerformanceFee]: { managerPerformanceFee: {} },
      [VaultConfigField.AdminPerformanceFee]: { adminPerformanceFee: {} },
      [VaultConfigField.ManagerManagementFee]: { managerManagementFee: {} },
      [VaultConfigField.AdminManagementFee]: { adminManagementFee: {} },
      [VaultConfigField.RedemptionFee]: { redemptionFee: {} },
      [VaultConfigField.IssuanceFee]: { issuanceFee: {} },
      [VaultConfigField.Manager]: { manager: {} },
    };

    const fieldVariant = fieldToVariant[field];
    if (!fieldVariant) {
      throw new Error(`Unknown vault config field: ${field}`);
    }

    return await this.vaultProgram.methods
      .updateVaultConfig(fieldVariant, data)
      .accountsPartial({
        admin,
        vault,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();
  }

  /**
   * Creates a deposit instruction for a vault
   *
   * @param {BN} amount - Amount of tokens to deposit
   * @param {Object} params - Deposit parameters
   * @param {PublicKey} params.userTransferAuthority - Public key of the user's transfer authority
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.vaultAssetMint - Public key of the vault asset mint
   * @param {PublicKey} params.assetTokenProgram - Public key of the asset token program
   * @returns {Promise<TransactionInstruction>} Transaction instruction for depositing tokens
   * @throws {Error} If instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createDepositVaultIx(
   *   new BN('1000000000'),
   *   {
   *     userTransferAuthority: userPubkey,
   *     vault: vaultPubkey,
   *     vaultAssetMint: mintPubkey,
   *     assetTokenProgram: tokenProgramPubkey
   *   }
   * );
   * ```
   */
  async createDepositVaultIx(
    amount: BN,
    {
      userTransferAuthority,
      vault,
      vaultAssetMint,
      assetTokenProgram,
    }: {
      userTransferAuthority: PublicKey;
      vault: PublicKey;
      vaultAssetMint: PublicKey;
      assetTokenProgram: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .depositVault(amount)
      .accounts({
        userTransferAuthority,
        vault,
        vaultAssetMint,
        assetTokenProgram,
      })
      .instruction();
  }

  /**
   * Creates a request withdraw instruction for a vault
   *
   * @param {RequestWithdrawVaultArgs} requestWithdrawArgs - Arguments for withdrawing from the vault
   * @param {BN} requestWithdrawArgs.amount - Amount of LP tokens to withdraw
   * @param {boolean} requestWithdrawArgs.isAmountInLp - Whether the amount is in LP tokens
   * @param {boolean} requestWithdrawArgs.isWithdrawAll - Whether to withdraw all assets
   * @param {Object} params - Request withdraw parameters
   * @param {PublicKey} params.payer - Public key of the payer
   * @param {PublicKey} params.userTransferAuthority - Public key of the user authority
   * @param {PublicKey} params.vault - Public key of the vault
   * @returns {Promise<TransactionInstruction>} Transaction instruction for withdrawal
   *
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * const ix = await client.createRequestWithdrawVaultIx(
   *   {
   *     amount: new BN('1000000000'),
   *     isAmountInLp: true,
   *     isWithdrawAll: false,
   *   },
   *   {
   *     payer: payerPubkey,
   *     userTransferAuthority: userPubkey,
   *     vault: vaultPubkey,
   *   }
   * );
   */
  async createRequestWithdrawVaultIx(
    { amount, isAmountInLp, isWithdrawAll }: RequestWithdrawVaultArgs,
    {
      payer,
      userTransferAuthority,
      vault,
    }: {
      payer: PublicKey;
      userTransferAuthority: PublicKey;
      vault: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .requestWithdrawVault(amount, isAmountInLp, isWithdrawAll)
      .accounts({
        payer,
        userTransferAuthority,
        vault,
      })
      .instruction();
  }

  /**
   * Creates a cancel withdraw instruction for a vault
   *
   * @param {Object} params - Cancel withdraw request parameters
   * @param {PublicKey} params.userTransferAuthority - Public key of the user authority
   * @param {PublicKey} params.vault - Public key of the vault
   * @returns {Promise<TransactionInstruction>} Transaction instruction for withdrawal
   *
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * const ix = await client.createCancelRequestWithdrawVaultIx(
   *   {
   *     userTransferAuthority: userPubkey,
   *     vault: vaultPubkey,
   *   }
   * );
   */
  async createCancelRequestWithdrawVaultIx({
    userTransferAuthority,
    vault,
  }: {
    userTransferAuthority: PublicKey;
    vault: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .cancelRequestWithdrawVault()
      .accounts({
        userTransferAuthority,
        vault,
      })
      .instruction();
  }

  /**
   * Creates a withdraw instruction for a vault
   *
   * @param {Object} params - Withdraw parameters
   * @param {PublicKey} params.userTransferAuthority - Public key of the user authority
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.vaultAssetMint - Public key of the vault asset mint
   * @param {PublicKey} params.assetTokenProgram - Public key of the asset token program
   * @returns {Promise<TransactionInstruction>} Transaction instruction for withdrawal
   *
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * const ix = await client.createWithdrawVaultIx(
   *   {
   *     userTransferAuthority: userPubkey,
   *     vault: vaultPubkey,
   *     vaultAssetMint: mintPubkey,
   *     assetTokenProgram: tokenProgramPubkey
   *   }
   * );
   */
  async createWithdrawVaultIx({
    userTransferAuthority,
    vault,
    vaultAssetMint,
    assetTokenProgram,
  }: {
    userTransferAuthority: PublicKey;
    vault: PublicKey;
    vaultAssetMint: PublicKey;
    assetTokenProgram: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .withdrawVault()
      .accounts({
        userTransferAuthority,
        vault,
        vaultAssetMint,
        assetTokenProgram,
      })
      .instruction();
  }

  // --------------------------------------- Strategy Instructions

  /**
   * Creates an instruction to add an adaptor to a vault
   * @param {Object} params - Parameters for adding adaptor to vault
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.payer - Public key of the payer
   * @param {PublicKey} params.admin - Public key of the admin
   * @param {PublicKey} params.adaptorProgram - Public key of the adaptor program
   * @returns {Promise<TransactionInstruction>} Transaction instruction for adding adaptor to vault
   *
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createAddAdaptorIx({
   *   vault: vaultPubkey,
   *   payer: payerPubkey,
   *   admin: adminPubkey,
   *   adaptorProgram: adaptorProgramPubkey
   * });
   * ```
   */
  async createAddAdaptorIx({
    vault,
    payer,
    admin,
    adaptorProgram = LENDING_ADAPTOR_PROGRAM_ID,
  }: {
    vault: PublicKey;
    payer: PublicKey;
    admin: PublicKey;
    adaptorProgram?: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .addAdaptor()
      .accountsPartial({
        payer,
        admin,
        vault,
        adaptorProgram,
      })
      .instruction();
  }

  /**
   * Creates an instruction to initialize a strategy to a vault
   * @param {InitializeStrategyArgs} initArgs - Arguments for strategy initialization
   * @param {Buffer | null} [initArgs.instructionDiscriminator] - Optional discriminator for the instruction
   * @param {Buffer | null} [initArgs.additionalArgs] - Optional additional arguments for the instruction
   * @param {Object} params - Parameters for initializing strategy to vault
   * @param {PublicKey} params.payer - Public key of the payer
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.manager - Public key of the manager
   * @param {PublicKey} params.strategy - Public key of the strategy
   * @param {PublicKey} params.adaptorProgram - Public key of the adaptor program
   * @param {Array<{ pubkey: PublicKey, isSigner: boolean, isWritable: boolean }>} params.remainingAccounts - Remaining accounts for the instruction
   * @returns {Promise<TransactionInstruction>} Transaction instruction for initializing strategy to vault
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createInitializeStrategyIx(
   *   {
   *     instructionDiscriminator: Buffer.from('...'), // optional
   *     additionalArgs: Buffer.from('...')           // optional
   *   },
   *   {
   *     payer: payerPubkey,
   *     vault: vaultPubkey,
   *     manager: managerPubkey,
   *     strategy: strategyPubkey,
   *     adaptorProgram: adaptorProgramPubkey,
   *     remainingAccounts: []
   *   }
   * );
   * ```
   */
  async createInitializeStrategyIx(
    {
      instructionDiscriminator = null,
      additionalArgs = null,
    }: InitializeStrategyArgs,
    {
      payer,
      vault,
      manager,
      strategy,
      adaptorProgram = LENDING_ADAPTOR_PROGRAM_ID,
      remainingAccounts,
    }: {
      payer: PublicKey;
      vault: PublicKey;
      manager: PublicKey;
      strategy: PublicKey;
      adaptorProgram?: PublicKey;
      remainingAccounts: Array<{
        pubkey: PublicKey;
        isSigner: boolean;
        isWritable: boolean;
      }>;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .initializeStrategy(
        instructionDiscriminator ?? null,
        additionalArgs ?? null
      )
      .accounts({
        payer,
        vault,
        manager,
        strategy,
        adaptorProgram,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();
  }

  /**
   * Creates an instruction to deposit assets into a strategy
   *
   * @param {DepositStrategyArgs} depositArgs - Deposit arguments
   * @param {BN} depositArgs.depositAmount - Amount of assets to deposit
   * @param {Buffer | null} [depositArgs.instructionDiscriminator] - Optional discriminator for the instruction
   * @param {Buffer | null} [depositArgs.additionalArgs] - Optional additional arguments for the instruction
   * @param {Object} params - Strategy deposit parameters
   * @param {PublicKey} params.manager - Public key of the manager
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.vaultAssetMint - Public key of the vault asset mint
   * @param {PublicKey} params.strategy - Public key of the strategy
   * @param {PublicKey} params.assetTokenProgram - Public key of the asset token program
   * @param {PublicKey} params.adaptorProgram - Public key of the adaptor program
   * @param {Array<{ pubkey: PublicKey, isSigner: boolean, isWritable: boolean }>} params.remainingAccounts - Remaining accounts for the instruction
   * @returns {Promise<TransactionInstruction>} Transaction instruction for depositing assets into strategy
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createDepositStrategyIx(
   *   {
   *     depositAmount: new BN('1000000000'),
   *     instructionDiscriminator: Buffer.from('...'),
   *     additionalArgs: Buffer.from('...')
   *   },
   *   {
   *     manager: managerPubkey,
   *     vault: vaultPubkey,
   *     vaultAssetMint: mintPubkey,
   *     strategy: strategyPubkey,
   *     assetTokenProgram: tokenProgramPubkey,
   *     adaptorProgram: adaptorProgramPubkey,
   *     remainingAccounts: []
   *   }
   * );
   * ```
   */
  async createDepositStrategyIx(
    {
      depositAmount,
      instructionDiscriminator = null,
      additionalArgs = null,
    }: DepositStrategyArgs,
    {
      manager,
      vault,
      vaultAssetMint,
      strategy,
      assetTokenProgram,
      adaptorProgram = LENDING_ADAPTOR_PROGRAM_ID,
      remainingAccounts,
    }: {
      manager: PublicKey;
      vault: PublicKey;
      vaultAssetMint: PublicKey;
      strategy: PublicKey;
      assetTokenProgram: PublicKey;
      adaptorProgram?: PublicKey;
      remainingAccounts: Array<{
        pubkey: PublicKey;
        isSigner: boolean;
        isWritable: boolean;
      }>;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .depositStrategy(depositAmount, instructionDiscriminator, additionalArgs)
      .accounts({
        manager,
        vault,
        vaultAssetMint,
        adaptorProgram,
        strategy,
        assetTokenProgram,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();
  }

  /**
   * Creates an instruction to withdraw assets from a strategy
   *
   * @param {WithdrawStrategyArgs} withdrawArgs - Withdrawal arguments
   * @param {BN} withdrawArgs.withdrawAmount - Amount of assets to withdraw
   * @param {Buffer | null} [withdrawArgs.instructionDiscriminator] - Optional discriminator for the instruction
   * @param {Buffer | null} [withdrawArgs.additionalArgs] - Optional additional arguments for the instruction
   * @param {Object} params - Strategy withdrawal parameters
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.vaultAssetMint - Public key of the vault asset mint
   * @param {PublicKey} params.strategy - Public key of the strategy
   * @param {PublicKey} params.assetTokenProgram - Public key of the asset token program
   * @param {PublicKey} params.adaptorProgram - Public key of the adaptor program
   * @param {Array<{ pubkey: PublicKey, isSigner: boolean, isWritable: boolean }>} params.remainingAccounts - Remaining accounts for the instruction
   * @returns {Promise<TransactionInstruction>} Transaction instruction for withdrawing assets from strategy
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createWithdrawStrategyIx(
   *   {
   *     withdrawAmount: new BN('1000000000'),
   *     instructionDiscriminator: Buffer.from('...'),
   *     additionalArgs: Buffer.from('...')
   *   },
   *   {
   *     vault: vaultPubkey,
   *     vaultAssetMint: mintPubkey,
   *     strategy: strategyPubkey,
   *     assetTokenProgram: tokenProgramPubkey,
   *     adaptorProgram: adaptorProgramPubkey,
   *     remainingAccounts: []
   *   }
   * );
   * ```
   */
  async createWithdrawStrategyIx(
    {
      withdrawAmount,
      instructionDiscriminator = null,
      additionalArgs = null,
    }: WithdrawStrategyArgs,
    {
      manager,
      vault,
      vaultAssetMint,
      strategy,
      assetTokenProgram,
      adaptorProgram = LENDING_ADAPTOR_PROGRAM_ID,
      remainingAccounts,
    }: {
      manager: PublicKey;
      vault: PublicKey;
      vaultAssetMint: PublicKey;
      strategy: PublicKey;
      assetTokenProgram: PublicKey;
      adaptorProgram?: PublicKey;
      remainingAccounts: Array<{
        pubkey: PublicKey;
        isSigner: boolean;
        isWritable: boolean;
      }>;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .withdrawStrategy(
        withdrawAmount,
        instructionDiscriminator,
        additionalArgs
      )
      .accounts({
        manager,
        vault,
        vaultAssetMint,
        adaptorProgram,
        strategy,
        assetTokenProgram,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();
  }

  /**
   * Creates an instruction to remove a strategy from a vault
   * @param {Object} params - Parameters for removing strategy
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.admin - Public key of the admin
   * @param {PublicKey} params.adaptorProgram - Public key of the adaptor program
   * @returns {Promise<TransactionInstruction>} Transaction instruction for removing adaptor from vault
   * @throws {Error} If instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createRemoveAdaptorIx({
   *   vault: vaultPubkey,
   *   admin: adminPubkey,
   *   adaptorProgram: adaptorProgramPubkey
   * });
   * ```
   */
  async createRemoveAdaptorIx({
    vault,
    admin,
    adaptorProgram = LENDING_ADAPTOR_PROGRAM_ID,
  }: {
    vault: PublicKey;
    admin: PublicKey;
    adaptorProgram?: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .removeAdaptor()
      .accountsPartial({
        vault,
        admin,
        adaptorProgram,
      })
      .instruction();
  }

  /**
   * Creates an instruction to initialize a direct withdraw strategy
   * @param {InitializeDirectWithdrawStrategyArgs} initArgs - Arguments for initializing direct withdraw strategy
   * @param {Buffer | null} initArgs.instructionDiscriminator - Optional discriminator for the instruction
   * @param {Buffer | null} initArgs.additionalArgs - Optional additional arguments for the instruction
   * @param {boolean} initArgs.allowUserArgs - Whether to allow user arguments
   * @param {Object} params - Parameters for initializing direct withdraw strategy
   * @param {PublicKey} params.payer - Public key of the payer
   * @param {PublicKey} params.admin - Public key of the admin
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.strategy - Public key of the strategy
   * @param {PublicKey} params.adaptorProgram - Public key of the adaptor program
   * @returns {Promise<TransactionInstruction>} Transaction instruction for initializing direct withdraw strategy
   * @throws {Error} If instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createInitializeDirectWithdrawStrategyIx(
   *   {
   *     instructionDiscriminator: Buffer.from('...'),
   *     additionalArgs: Buffer.from('...'),
   *     allowUserArgs: true
   *   },
   *   {
   *     payer: payerPubkey,
   *     admin: adminPubkey,
   *     vault: vaultPubkey,
   *     strategy: strategyPubkey,
   *     adaptorProgram: adaptorProgramPubkey
   *   }
   * );
   * ```
   */
  async createInitializeDirectWithdrawStrategyIx(
    {
      instructionDiscriminator = null,
      additionalArgs = null,
      allowUserArgs = false,
    }: InitializeDirectWithdrawStrategyArgs,
    {
      payer,
      admin,
      vault,
      strategy,
      adaptorProgram = LENDING_ADAPTOR_PROGRAM_ID,
    }: {
      payer: PublicKey;
      admin: PublicKey;
      vault: PublicKey;
      strategy: PublicKey;
      adaptorProgram?: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .initializeDirectWithdrawStrategy(
        instructionDiscriminator,
        additionalArgs,
        allowUserArgs
      )
      .accountsPartial({
        payer,
        admin,
        vault,
        strategy,
        adaptorProgram,
      })
      .instruction();
  }

  /**
   * Creates an instruction to withdraw assets from a direct withdraw strategy
   * @param {Object} directWithdrawArgs - Withdrawal arguments
   * @param {Buffer | null} [directWithdrawArgs.userArgs] - Optional user arguments for the instruction
   * @param {Object} params - Parameters for withdrawing assets from direct withdraw strategy
   * @param {PublicKey} params.user - Public key of the user
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.strategy - Public key of the strategy
   * @param {PublicKey} params.vaultAssetMint - Public key of the vault asset mint
   * @param {PublicKey} params.assetTokenProgram - Public key of the asset token program
   * @param {PublicKey} params.adaptorProgram - Public key of the adaptor program
   * @param {Array<{ pubkey: PublicKey, isSigner: boolean, isWritable: boolean }>} params.remainingAccounts - Remaining accounts for the instruction
   * @returns {Promise<TransactionInstruction>} Transaction instruction for withdrawing assets from direct withdraw strategy
   * @throws {Error} If instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createDirectWithdrawStrategyIx(
   *   {
   *     userArgs: Buffer.from('...')
   *   },
   *   {
   *     user: userPubkey,
   *     vault: vaultPubkey,
   *     strategy: strategyPubkey,
   *     vaultAssetMint: mintPubkey,
   *     assetTokenProgram: tokenProgramPubkey,
   *     adaptorProgram: adaptorProgramPubkey,
   *     remainingAccounts: []
   *   }
   * );
   * ```
   */
  async createDirectWithdrawStrategyIx(
    { userArgs = null }: { userArgs?: Buffer | null },
    {
      user,
      vault,
      strategy,
      vaultAssetMint,
      assetTokenProgram,
      adaptorProgram = LENDING_ADAPTOR_PROGRAM_ID,
      remainingAccounts,
    }: {
      user: PublicKey;
      vault: PublicKey;
      strategy: PublicKey;
      vaultAssetMint: PublicKey;
      assetTokenProgram: PublicKey;
      adaptorProgram?: PublicKey;
      remainingAccounts: Array<{
        pubkey: PublicKey;
        isSigner: boolean;
        isWritable: boolean;
      }>;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .directWithdrawStrategy(userArgs)
      .accounts({
        userTransferAuthority: user,
        strategy,
        adaptorProgram,
        vault,
        vaultAssetMint,
        assetTokenProgram,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();
  }

  /**
   * Creates an instruction to harvest fees from a vault
   * @param {Object} params - Parameters for harvesting fees
   * @param {PublicKey} params.harvester - Public key of the harvester
   * @param {PublicKey} params.vaultManager - Public key of the vault manager
   * @param {PublicKey} params.vaultAdmin - Public key of the vault admin
   * @param {PublicKey} params.protocolAdmin - Public key of the protocol admin
   * @param {PublicKey} params.vault - Public key of the vault
   * @returns {Promise<TransactionInstruction>} Transaction instruction for harvesting fees
   * @throws {Error} If instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createHarvestFeeIx({
   *   harvester: harvesterPubkey,
   *   vaultManager: vaultManagerPubkey,
   *   vaultAdmin: vaultAdminPubkey,
   *   protocolAdmin: protocolAdminPubkey,
   *   vault: vaultPubkey,
   * });
   * ```
   */
  async createHarvestFeeIx({
    harvester,
    vaultManager,
    vaultAdmin,
    protocolAdmin,
    vault,
  }: {
    harvester: PublicKey;
    vaultManager: PublicKey;
    vaultAdmin: PublicKey;
    protocolAdmin: PublicKey;
    vault: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .harvestFee()
      .accounts({
        harvester,
        vaultManager,
        vaultAdmin,
        vault,
        protocolAdmin,
      })
      .instruction();
  }

  /**
   * Creates an instruction to close a strategy
   * @param {Object} params - Parameters for closing strategy
   * @param {PublicKey} params.payer - Public key of the payer
   * @param {PublicKey} params.manager - Public key of the manager
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.strategy - Public key of the strategy
   * @returns {Promise<TransactionInstruction>} Transaction instruction for closing strategy
   * @throws {Error} If instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createCloseStrategyIx({
   *   payer: payerPubkey,
   *   manager: managerPubkey,
   *   vault: vaultPubkey,
   *   strategy: strategyPubkey,
   * });
   * ```
   */
  async createCloseStrategyIx({
    payer,
    manager,
    vault,
    strategy,
  }: {
    payer: PublicKey;
    manager: PublicKey;
    vault: PublicKey;
    strategy: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .closeStrategy()
      .accounts({
        payer,
        manager,
        vault,
        strategy,
      })
      .instruction();
  }

  /**
   * Creates an instruction to calibrate the high water mark
   * @param {Object} params - Parameters for calibrating the high water mark
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.admin - Public key of the admin
   * @returns {Promise<TransactionInstruction>} Transaction instruction for calibrating the high water mark
   * @throws {Error} If instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createCalibrateHighWaterMarkIx({
   *   vault: vaultPubkey,
   *   admin: adminPubkey,
   * });
   * ```
   */
  async createCalibrateHighWaterMarkIx({
    vault,
    admin,
  }: {
    vault: PublicKey;
    admin: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .calibrateHighWaterMark()
      .accountsPartial({
        vault,
        admin,
      })
      .instruction();
  }

  /**
   * Creates an instruction to create LP metadata
   * @param {Object} createLpMetadataArgs - Parameters for creating LP metadata
   * @param {string} createLpMetadataArgs.name - Name of the LP
   * @param {string} createLpMetadataArgs.symbol - Symbol of the LP
   * @param {string} createLpMetadataArgs.uri - URI of the LP metadata
   * @param {Object} params - Parameters for creating LP metadata
   * @param {PublicKey} params.payer - Public key of the payer
   * @param {PublicKey} params.admin - Public key of the admin
   * @param {PublicKey} params.vault - Public key of the vault
   * @returns {Promise<TransactionInstruction>} Transaction instruction for creating LP metadata
   * @throws {Error} If instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createCreateLpMetadataIx({
   *   name: "My LP",
   *   symbol: "MYLP",
   *   uri: "https://mylp.com/metadata",
   * });
   * ```
   */
  async createCreateLpMetadataIx(
    {
      name,
      symbol,
      uri,
    }: {
      name: string;
      symbol: string;
      uri: string;
    },
    {
      payer,
      admin,
      vault,
    }: {
      payer: PublicKey;
      admin: PublicKey;
      vault: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    const metadataAccount = this.findLpMetadataAccount(vault);
    return await this.vaultProgram.methods
      .createLpMetadata(name, symbol, uri)
      .accountsPartial({
        payer,
        vault,
        admin,
        metadataAccount,
      })
      .instruction();
  }
  // --------------------------------------- Account Fetching All

  /**
   * Fetches all strategy init receipt accounts
   * @returns Promise resolving to an array of strategy init receipt accounts
   *
   * @example
   * ```typescript
   * const strategyInitReceiptAccounts = await client.fetchAllStrategyInitReceiptAccounts();
   * ```
   */
  async fetchAllStrategyInitReceiptAccounts() {
    return await this.vaultProgram.account.strategyInitReceipt.all();
  }

  /**
   * Fetches all strategy init receipt accounts of a vault
   * @param vault - Public key of the vault
   * @returns Promise resolving to an array of strategy init receipt accounts
   *
   * @example
   * ```typescript
   * const strategyInitReceiptAccounts = await client.fetchAllStrategyInitReceiptAccountsOfVault(vaultPubkey);
   * ```
   */
  async fetchAllStrategyInitReceiptAccountsOfVault(vault: PublicKey) {
    return await this.vaultProgram.account.strategyInitReceipt.all([
      {
        memcmp: {
          offset: 8, // 8 for discriminator
          bytes: vault.toBase58(),
        },
      },
    ]);
  }

  /**
   * Fetches all request withdraw vault receipt accounts of a vault
   * @param vault - Public key of the vault
   * @returns Promise resolving to an array of request withdraw vault receipt accounts
   *
   * @example
   * ```typescript
   * const requestWithdrawVaultReceiptAccounts = await client.fetchAllRequestWithdrawVaultReceiptsOfVault(vaultPubkey);
   * ```
   */
  async fetchAllRequestWithdrawVaultReceiptsOfVault(vault: PublicKey) {
    return await this.vaultProgram.account.requestWithdrawVaultReceipt.all([
      {
        memcmp: {
          offset: 8, // 8 for discriminator
          bytes: vault.toBase58(),
        },
      },
    ]);
  }

  /**
   * Fetches all adaptor add receipt accounts of a vault
   * @param vault - Public key of the vault
   * @returns Promise resolving to an array of adaptor add receipt accounts
   *
   * @example
   * ```typescript
   * const adaptorAddReceiptAccounts = await client.fetchAllAdaptorAddReceiptAccountsOfVault(vaultPubkey);
   * ```
   */
  async fetchAllAdaptorAddReceiptAccountsOfVault(vault: PublicKey) {
    return await this.vaultProgram.account.adaptorAddReceipt.all([
      {
        memcmp: {
          offset: 8, // 8 for discriminator
          bytes: vault.toBase58(),
        },
      },
    ]);
  }

  // --------------------------------------- Account Fetching

  /**
   * Fetches a vault account's data
   * @param vault - Public key of the vault
   * @returns Promise resolving to the vault account data
   */
  async fetchVaultAccount(vault: PublicKey) {
    return await this.vaultProgram.account.vault.fetch(
      vault,
      this.provider.opts.commitment
    );
  }

  /**
   * Fetches a strategy init receipt account's data
   * @param strategyInitReceipt - Public key of the strategy init receipt account
   * @returns Promise resolving to the strategy init receipt account data
   *
   * @example
   * ```typescript
   * const strategyInitReceiptAccount = await client.fetchStrategyInitReceiptAccount(strategyInitReceiptPubkey);
   * ```
   */
  async fetchStrategyInitReceiptAccount(strategyInitReceipt: PublicKey) {
    return await this.vaultProgram.account.strategyInitReceipt.fetch(
      strategyInitReceipt,
      this.provider.opts.commitment
    );
  }

  /**
   * Fetches an adaptor add receipt account's data
   * @param adaptorAddReceipt - Public key of the adaptor add receipt account
   * @returns Promise resolving to the adaptor add receipt account data
   *
   * @example
   * ```typescript
   * const adaptorAddReceiptAccount = await client.fetchAdaptorAddReceiptAccount(adaptorAddReceiptPubkey);
   * ```
   */
  async fetchAdaptorAddReceiptAccount(adaptorAddReceipt: PublicKey) {
    return await this.vaultProgram.account.adaptorAddReceipt.fetch(
      adaptorAddReceipt,
      this.provider.opts.commitment
    );
  }

  /**
   * Fetches a request withdraw vault receipt account's data
   * @param requestWithdrawVaultReceipt - Public key of the request withdraw vault receipt account
   * @returns Promise resolving to the request withdraw vault receipt account data
   *
   * @example
   * ```typescript
   * const requestWithdrawVaultReceiptAccount = await client.fetchRequestWithdrawVaultReceiptAccount(requestWithdrawVaultReceiptPubkey);
   * ```
   */
  async fetchRequestWithdrawVaultReceiptAccount(
    requestWithdrawVaultReceipt: PublicKey
  ) {
    return await this.vaultProgram.account.requestWithdrawVaultReceipt.fetch(
      requestWithdrawVaultReceipt,
      this.provider.opts.commitment
    );
  }

  // --------------------------------------- Helpers

  /**
   * Fetches the position and total values for a vault
   * @param vault - Public key of the vault
   * @returns Promise resolving to the position and total values
   *
   * @example
   * ```typescript
   * const positionAndTotalValues = await client.getPositionAndTotalValuesForVault(vaultPubkey);
   * ```
   */
  async getPositionAndTotalValuesForVault(vault: PublicKey) {
    const vaultAccount = await this.fetchVaultAccount(vault);
    const totalAssetValue: BN = vaultAccount.asset.totalValue;
    const strategyInitReceiptAccounts =
      await this.fetchAllStrategyInitReceiptAccountsOfVault(vault);
    const strategyInfo = strategyInitReceiptAccounts.map(
      (vaultStrategyAccount) => ({
        strategyId: vaultStrategyAccount.account.strategy.toBase58(),
        amount: vaultStrategyAccount.account.positionValue.toNumber(),
      })
    );

    return {
      totalValue: totalAssetValue.toNumber(),
      strategies: strategyInfo,
    };
  }

  /**
   * Fetches the accumulated admin fees for a vault
   * @param vault - Public key of the vault
   * @returns Promise resolving to the accumulated admin fees
   *
   * @example
   * ```typescript
   * const accumulatedAdminFees = await client.getAccumulatedAdminFeesForVault(vaultPubkey);
   * ```
   */
  async getAccumulatedAdminFeesForVault(vault: PublicKey) {
    const vaultAccount = await this.fetchVaultAccount(vault);
    return vaultAccount.feeState.accumulatedLpAdminFees;
  }

  /**
   * Fetches the accumulated manager fees for a vault
   * @param vault - Public key of the vault
   * @returns Promise resolving to the accumulated manager fees
   *
   * @example
   * ```typescript
   * const accumulatedManagerFees = await client.getAccumulatedManagerFeesForVault(vaultPubkey);
   * ```
   */
  async getAccumulatedManagerFeesForVault(vault: PublicKey) {
    const vaultAccount = await this.fetchVaultAccount(vault);
    return vaultAccount.feeState.accumulatedLpManagerFees;
  }

  /**
   * Fetches the current asset per LP for a vault
   * @param vault - Public key of the vault
   * @returns Promise resolving to the current asset per LP
   *
   * @example
   * ```typescript
   * const currentAssetPerLp = await client.getCurrentAssetPerLpForVault(vaultPubkey);
   * ```
   */
  async getCurrentAssetPerLpForVault(vault: PublicKey) {
    const vaultLpMint = this.findVaultLpMint(vault);
    const vaultAccount = await this.fetchVaultAccount(vault);
    const lpSupply = await getMint(
      this.conn,
      vaultLpMint,
      this.provider.opts.commitment
    ).then((lp) => new BN(lp.supply.toString()));
    const unharvestedFeesLp = vaultAccount.feeState.accumulatedLpAdminFees
      .add(vaultAccount.feeState.accumulatedLpManagerFees)
      .add(vaultAccount.feeState.accumulatedLpProtocolFees);

    const totalLpSupply = unharvestedFeesLp.add(lpSupply);

    const currentAssetPerLp =
      vaultAccount.asset.totalValue.toNumber() / totalLpSupply.toNumber();

    return currentAssetPerLp;
  }

  /**
   * Fetches the high water mark for a vault
   * @param vault - Public key of the vault
   * @returns Promise resolving to the high water mark
   *
   * @example
   * ```typescript
   * const highWaterMark = await client.getHighWaterMarkForVault(vaultPubkey);
   * ```
   */
  async getHighWaterMarkForVault(vault: PublicKey) {
    const vaultAccount = await this.fetchVaultAccount(vault);
    const highWaterMarkValue = convertDecimalBitsToDecimal(
      vaultAccount.highWaterMark.highestAssetPerLpDecimalBits
    );

    return {
      highestAssetPerLp: highWaterMarkValue.toNumber(),
      lastUpdatedTs: vaultAccount.highWaterMark.lastUpdatedTs.toNumber(),
    };
  }

  /**
   * Processes a withdrawal receipt into a standardized withdrawal info object
   * @private
   */
  private async processWithdrawalReceipt(
    receipt: {
      account: {
        user: PublicKey;
        amountAssetToWithdrawDecimalBits: BN;
        amountLpEscrowed: BN;
        withdrawableFromTs: BN;
      };
    },
    vaultAccount: any,
    lpSupply: BN
  ) {
    const amountAssetToWithdrawDecimal = convertDecimalBitsToDecimal(
      receipt.account.amountAssetToWithdrawDecimalBits
    );
    const amountAssetToWithdrawAtRequest =
      amountAssetToWithdrawDecimal.toNumber();
    const amountLpEscrowed = receipt.account.amountLpEscrowed;

    const amountAssetToWithdrawAtPresent =
      this.calculateAssetsForWithdrawHelper(
        vaultAccount.asset.totalValue,
        vaultAccount.lockedProfitState.lastUpdatedLockedProfit,
        vaultAccount.vaultConfiguration.lockedProfitDegradationDuration,
        vaultAccount.feeState.accumulatedLpAdminFees,
        vaultAccount.feeState.accumulatedLpManagerFees,
        vaultAccount.feeState.accumulatedLpProtocolFees,
        vaultAccount.feeConfiguration.redemptionFee,
        vaultAccount.feeConfiguration.managerManagementFee +
          vaultAccount.feeConfiguration.adminManagementFee,
        vaultAccount.feeUpdate.lastManagementFeeUpdateTs,
        lpSupply,
        amountLpEscrowed
      ).toNumber();

    // Cap the withdrawal amount to the initial request amount
    const amountAssetToWithdrawEffective = Math.min(
      amountAssetToWithdrawAtPresent,
      amountAssetToWithdrawAtRequest
    );

    return {
      user: receipt.account.user,
      amountAssetToWithdrawEffective,
      amountAssetToWithdrawAtRequest,
      amountAssetToWithdrawAtPresent,
      amountLpEscrowed: amountLpEscrowed.toNumber(),
      withdrawableFromTs: receipt.account.withdrawableFromTs.toNumber(),
    };
  }

  /**
   * Fetches the pending withdrawal for a user
   * @param vault - Public key of the vault
   * @param user - Public key of the user
   * @returns Promise resolving to the pending withdrawal
   *
   * @example
   * ```typescript
   * const pendingWithdrawal = await client.getPendingWithdrawalForUser(vaultPubkey, userPubkey);
   * ```
   */
  async getPendingWithdrawalForUser(vault: PublicKey, user: PublicKey) {
    const [vaultAccount, lp] = await Promise.all([
      this.fetchVaultAccount(vault),
      getMint(
        this.conn,
        this.findVaultLpMint(vault),
        this.provider.opts.commitment
      ),
    ]);

    const requestWithdrawVaultReceiptAddress =
      this.findRequestWithdrawVaultReceipt(vault, user);
    const receipt = await this.fetchRequestWithdrawVaultReceiptAccount(
      requestWithdrawVaultReceiptAddress
    );

    return this.processWithdrawalReceipt(
      { account: receipt },
      vaultAccount,
      new BN(lp.supply.toString())
    );
  }

  /**
   * Fetches all pending withdrawals for a vault
   * @param vault - Public key of the vault
   * @returns Promise resolving to an array of pending withdrawals
   *
   * @example
   * ```typescript
   * const pendingWithdrawals = await client.getAllPendingWithdrawalsForVault(vaultPubkey);
   * ```
   */
  async getAllPendingWithdrawalsForVault(vault: PublicKey) {
    const [requestWithdrawVaultReceipts, vaultAccount, lp] = await Promise.all([
      this.fetchAllRequestWithdrawVaultReceiptsOfVault(vault),
      this.fetchVaultAccount(vault),
      getMint(
        this.conn,
        this.findVaultLpMint(vault),
        this.provider.opts.commitment
      ),
    ]);

    const lpSupply = new BN(lp.supply.toString());

    return Promise.all(
      requestWithdrawVaultReceipts.map((receipt) =>
        this.processWithdrawalReceipt(receipt, vaultAccount, lpSupply)
      )
    );
  }

  calculateLockedProfit(
    lastUpdatedLockedProfit: BN,
    lockedProfitDegradationDuration: BN,
    currentTime: BN
  ): BN {
    if (lockedProfitDegradationDuration.eq(new BN(0))) return new BN(0);

    const duration = currentTime.sub(lastUpdatedLockedProfit);
    const lockedProfit = lastUpdatedLockedProfit
      .mul(lockedProfitDegradationDuration.sub(duration))
      .div(lockedProfitDegradationDuration);

    if (duration.gt(lockedProfitDegradationDuration)) return new BN(0);
    else return lockedProfit;
  }

  private getProjectedLpSupply(
    currentTotalLp: BN,
    assetTotalValue: BN,
    lastManagementFeeUpdateTs: BN,
    managementFeeBps: BN
  ): BN {
    if (
      lastManagementFeeUpdateTs.eq(new BN(0)) ||
      assetTotalValue.eq(new BN(0)) ||
      managementFeeBps.eq(new BN(0))
    ) {
      return currentTotalLp;
    }

    const nowBn = new BN(Math.floor(Date.now() / 1000));
    const timeElapsed = BN.max(new BN(0), nowBn.sub(lastManagementFeeUpdateTs));

    if (timeElapsed.eq(new BN(0))) {
      return currentTotalLp;
    }

    const feeAmountInAsset = assetTotalValue
      .mul(timeElapsed)
      .mul(new BN(managementFeeBps))
      .div(MAX_FEE_BPS_BN)
      .div(ONE_YEAR_BN);

    const lpNumerator = feeAmountInAsset.mul(currentTotalLp);
    const lpDenominator = assetTotalValue.sub(feeAmountInAsset);

    const pendingLpToMint = lpNumerator
      .add(lpDenominator)
      .sub(new BN(1))
      .div(lpDenominator);

    return currentTotalLp.add(pendingLpToMint);
  }

  calculateAssetsForWithdrawHelper(
    vaultTotalValue: BN,
    vaultLastUpdatedLockedProfit: BN,
    vaultLockedProfitDegradationDuration: BN,
    vaultAccumulatedLpAdminFees: BN,
    vaultAccumulatedLpManagerFees: BN,
    vaultAccumulatedLpProtocolFees: BN,
    vaultRedemptionFeeBps: number,
    vaultManagementFeeBps: number,
    vaultLastManagementFeeUpdateTs: BN,
    lpSupply: BN,
    lpAmount: BN
  ): BN {
    if (lpSupply <= new BN(0)) throw new Error("Invalid LP supply");
    if (vaultTotalValue <= new BN(0)) throw new Error("Invalid total assets");

    const lockedProfit = this.calculateLockedProfit(
      vaultLastUpdatedLockedProfit,
      vaultLockedProfitDegradationDuration,
      new BN(Date.now() / 1000)
    );

    const totalUnlockedValue = vaultTotalValue.sub(lockedProfit);

    const unharvestedFeesLp = vaultAccumulatedLpAdminFees
      .add(vaultAccumulatedLpManagerFees)
      .add(vaultAccumulatedLpProtocolFees);
    const lpSupplyInclAccumulatedFees = lpSupply.add(unharvestedFeesLp);
    const lpSupplyInclFees = this.getProjectedLpSupply(
      lpSupplyInclAccumulatedFees,
      vaultTotalValue,
      vaultLastManagementFeeUpdateTs,
      new BN(vaultManagementFeeBps)
    );

    // asset_to_redeem_pre_fee = amount * (total_asset_pre_withdraw / total_lp_supply_pre_withdraw)
    // asset_to_redeem_post_fee = asset_to_redeem_pre_fee * (10000 - redemption_fee_bps) / 10000
    const assetToRedeemNumerator = lpAmount
      .mul(totalUnlockedValue)
      .mul(new BN(10000 - vaultRedemptionFeeBps));

    const assetToRedeemDenominator = lpSupplyInclFees.mul(new BN(10000));

    const amount = assetToRedeemNumerator.div(assetToRedeemDenominator);

    return amount;
  }

  /**
   * Calculates the amount of assets that would be received for a given LP token amount
   *
   * @param vaultPk - Public key of the vault
   * @param lpAmount - Amount of LP tokens to calculate for
   * @returns Promise resolving to the amount of assets that would be received
   *
   * @throws {Error} If LP supply or total assets are invalid
   * @throws {Error} If math overflow occurs during calculation
   *
   * @example
   * ```typescript
   * const assetsToReceive = await client.calculateAssetsForWithdraw(
   *   vaultPubkey,
   *   new BN('1000000000')
   * );
   * ```
   */
  async calculateAssetsForWithdraw(
    vaultPk: PublicKey,
    lpAmount: BN
  ): Promise<BN> {
    try {
      const vault = await this.fetchVaultAccount(vaultPk);
      const lpMint = this.findVaultLpMint(vaultPk);
      const lp = await getMint(
        this.conn,
        lpMint,
        this.provider.opts.commitment
      );

      const amount = this.calculateAssetsForWithdrawHelper(
        vault.asset.totalValue,
        vault.lockedProfitState.lastUpdatedLockedProfit,
        vault.vaultConfiguration.lockedProfitDegradationDuration,
        vault.feeState.accumulatedLpAdminFees,
        vault.feeState.accumulatedLpManagerFees,
        vault.feeState.accumulatedLpProtocolFees,
        vault.feeConfiguration.redemptionFee,
        vault.feeConfiguration.managerManagementFee +
          vault.feeConfiguration.adminManagementFee,
        vault.feeUpdate.lastManagementFeeUpdateTs,
        new BN(lp.supply.toString()),
        lpAmount
      );

      return amount;
    } catch (e) {
      throw new Error("Math overflow in asset calculation for withdraw");
    }
  }

  /**
   * Calculates the amount of LP tokens that would be burned for a given asset amount
   *
   * @param vaultPk - Public key of the vault
   * @param assetAmount - Amount of assets to calculate for
   * @returns Promise resolving to the amount of LP tokens that would be burned
   *
   * @throws {Error} If LP supply or total assets are invalid
   * @throws {Error} If math overflow occurs during calculation
   *
   * @example
   * ```typescript
   * const lpTokensToBurn = await client.calculateLpForWithdraw(
   *   vaultPubkey,
   *   new BN('1000000000')
   * );
   * ```
   */
  async calculateLpForWithdraw(
    vaultPk: PublicKey,
    assetAmount: BN
  ): Promise<BN> {
    try {
      const vault = await this.fetchVaultAccount(vaultPk);
      const totalValue = vault.asset.totalValue;
      const lockedProfit = this.calculateLockedProfit(
        vault.lockedProfitState.lastUpdatedLockedProfit,
        vault.vaultConfiguration.lockedProfitDegradationDuration,
        new BN(Date.now() / 1000)
      );
      const totalUnlockedValue = totalValue.sub(lockedProfit);

      const lpMint = this.findVaultLpMint(vaultPk);
      const lp = await getMint(
        this.conn,
        lpMint,
        this.provider.opts.commitment
      );
      const lpSupply = new BN(lp.supply.toString());

      // Validate inputs
      if (lpSupply <= new BN(0)) throw new Error("Invalid LP supply");
      if (totalValue <= new BN(0)) throw new Error("Invalid total assets");

      const unharvestedFeesLp = vault.feeState.accumulatedLpAdminFees
        .add(vault.feeState.accumulatedLpManagerFees)
        .add(vault.feeState.accumulatedLpProtocolFees);
      const lpSupplyInclAccumulatedFees = lpSupply.add(unharvestedFeesLp);
      const lpSupplyInclFees = this.getProjectedLpSupply(
        lpSupplyInclAccumulatedFees,
        totalValue,
        vault.feeUpdate.lastManagementFeeUpdateTs,
        new BN(
          vault.feeConfiguration.managerManagementFee +
            vault.feeConfiguration.adminManagementFee
        )
      );

      // lp_to_burn_pre_fee = redeem_amount * (total_lp_supply_pre_withdraw / total_asset_pre_withdraw)
      // lp_to_burn_post_fee = lp_to_burn_pre_fee  * (10000 / (10000 - redemption_fee_bps))
      const lpToBurnNumerator = assetAmount
        .mul(lpSupplyInclFees)
        .mul(new BN(10000));
      const lpToBurnDenominator = totalUnlockedValue.mul(
        new BN(10000 - vault.feeConfiguration.redemptionFee)
      );

      const lpToBurn = lpToBurnNumerator.div(lpToBurnDenominator);

      return lpToBurn;
    } catch (e) {
      throw new Error("Math overflow in LP token calculation for withdraw");
    }
  }

  /**
   * Calculates the amount of LP tokens that would be received for a given asset deposit
   *
   * @param vaultPk - Public key of the vault
   * @param assetAmount - Amount of assets to deposit
   * @returns Promise resolving to the amount of LP tokens that would be received
   *
   * @throws {Error} If math overflow occurs during calculation
   *
   * @example
   * ```typescript
   * const lpTokens = await client.calculateLpTokensForDeposit(
   *   vaultPubkey
   *   new BN('1000000000'),
   * );
   * ```
   */
  async calculateLpForDeposit(
    vaultPk: PublicKey,
    assetAmount: BN
  ): Promise<BN> {
    const vault = await this.fetchVaultAccount(vaultPk);
    const totalValue = vault.asset.totalValue;
    const lpMint = this.findVaultLpMint(vaultPk);
    const lp = await getMint(this.conn, lpMint, this.provider.opts.commitment);
    const lpSupply = new BN(lp.supply.toString());

    const unharvestedFeesLp = vault.feeState.accumulatedLpAdminFees
      .add(vault.feeState.accumulatedLpManagerFees)
      .add(vault.feeState.accumulatedLpProtocolFees);
    const lpSupplyInclAccumulatedFees = lpSupply.add(unharvestedFeesLp);
    const lpSupplyInclFees = this.getProjectedLpSupply(
      lpSupplyInclAccumulatedFees,
      totalValue,
      vault.feeUpdate.lastManagementFeeUpdateTs,
      new BN(
        vault.feeConfiguration.managerManagementFee +
          vault.feeConfiguration.adminManagementFee
      )
    );

    // If the pool is empty, mint LP tokens 1:1 with deposit
    if (lpSupplyInclFees.eq(new BN(0))) {
      const assetMint = await getMint(
        this.conn,
        vault.asset.mint,
        this.provider.opts.commitment
      );
      const assetDecimals = assetMint.decimals;
      const lpDecimals = lp.decimals;
      return assetAmount
        .mul(new BN(10 ** lpDecimals))
        .div(new BN(10 ** assetDecimals));
    }

    try {
      const lpToMintNumerator = assetAmount
        .mul(lpSupplyInclFees)
        .mul(new BN(10000 - vault.feeConfiguration.issuanceFee));

      const totalAssetPostDeposit = totalValue.add(assetAmount);
      const lpToMintDenominator = totalAssetPostDeposit
        .mul(new BN(10000))
        .sub(
          assetAmount.mul(new BN(10000 - vault.feeConfiguration.issuanceFee))
        );

      const lpToMint = lpToMintNumerator.div(lpToMintDenominator);

      return lpToMint;
    } catch (e) {
      throw new Error("Math overflow in LP token calculation for deposit");
    }
  }
}
