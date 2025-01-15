import {
  Program,
  AnchorProvider,
  Idl,
  setProvider,
  BN,
  Wallet,
} from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getMint,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

import { DEFAULT_ADAPTOR_PROGRAM_ID, SEEDS } from "./constants";
import {
  VaultParams,
  VoltrVault,
  InitializeStrategyArgs,
  depositStrategyArgs,
  withdrawStrategyArgs,
} from "./types";

// Import IDL files
import * as vaultIdl from "./idl/voltr_vault.json";

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
 * import { VoltrClient } from '@voltr/sdk';
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
  constructor(conn: Connection, wallet?: Keypair) {
    super(conn);

    // Initialize programs
    this.setProvider(wallet);
    this.setPrograms(vaultIdl as any);
  }

  private setProvider(wallet?: Keypair) {
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
      AnchorProvider.defaultOptions()
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
   * Finds the vault's LP fee authority address
   * @param vault - Public key of the vault
   * @returns The PDA for the vault's LP fee authority
   *
   * @example
   * ```typescript
   * const feeAuth = client.findVaultLpFeeAuth(vaultPubkey);
   * ```
   */
  findVaultLpFeeAuth(vault: PublicKey) {
    const [vaultLpFeeAuth] = PublicKey.findProgramAddressSync(
      [SEEDS.VAULT_LP_FEE_AUTH, vault.toBuffer()],
      this.vaultProgram.programId
    );
    return vaultLpFeeAuth;
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
    const vaultLpFeeAuth = this.findVaultLpFeeAuth(vault);

    return {
      vaultLpMint,
      vaultAssetIdleAuth,
      vaultLpFeeAuth,
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

  // --------------------------------------- Vault Instructions
  /**
   * Creates an instruction to initialize a new vault
   *
   * @param {VaultParams} vaultParams - Configuration parameters for the vault
   * @param {VaultConfig} vaultParams.config - Vault configuration settings
   * @param {BN} vaultParams.config.maxCap - Maximum capacity of the vault
   * @param {BN} vaultParams.config.startAtTs - Vault start timestamp in seconds
   * @param {number} vaultParams.config.managerManagementFee - Manager's management fee in basis points (e.g., 50 = 0.5%)
   * @param {number} vaultParams.config.managerPerformanceFee - Manager's performance fee in basis points (e.g., 1000 = 10%)
   * @param {number} vaultParams.config.adminManagementFee - Admin's management fee in basis points (e.g., 50 = 0.5%)
   * @param {number} vaultParams.config.adminPerformanceFee - Admin's performance fee in basis points (e.g., 1000 = 10%)
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
      vault: Keypair;
      vaultAssetMint: PublicKey;
      admin: PublicKey;
      manager: PublicKey;
      payer: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    const addresses = this.findVaultAddresses(vault.publicKey);

    const vaultAssetIdleAta = getAssociatedTokenAddressSync(
      vaultAssetMint,
      addresses.vaultAssetIdleAuth,
      true
    );

    const vaultLpFeeAta = getAssociatedTokenAddressSync(
      addresses.vaultLpMint,
      addresses.vaultLpFeeAuth,
      true
    );

    return await this.vaultProgram.methods
      .initialize(vaultParams.config, vaultParams.name, vaultParams.description)
      .accounts({
        payer,
        admin,
        manager,
        vault: vault.publicKey,
        vaultAssetMint,
        vaultAssetIdleAta,
        vaultLpFeeAta,
        assetTokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
  }

  /**
   * Creates a deposit instruction
   *
   * @param {BN} amount - Amount of tokens to deposit
   * @param {Object} params - Deposit parameters
   * @param {PublicKey} params.userAuthority - Public key of the user's transfer authority
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.vaultAssetMint - Public key of the vault asset mint
   * @param {PublicKey} params.assetTokenProgram - Public key of the asset token program
   * @returns {Promise<TransactionInstruction>} Transaction instruction for depositing tokens
   * @throws {Error} If instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createDepositIx(
   *   new BN('1000000000'),
   *   {
   *     userAuthority: userPubkey,
   *     vault: vaultPubkey,
   *     vaultAssetMint: mintPubkey,
   *     assetTokenProgram: tokenProgramPubkey
   *   }
   * );
   * ```
   */
  async createDepositIx(
    amount: BN,
    {
      userAuthority,
      vault,
      vaultAssetMint,
      assetTokenProgram,
    }: {
      userAuthority: PublicKey;
      vault: PublicKey;
      vaultAssetMint: PublicKey;
      assetTokenProgram: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .deposit(amount)
      .accounts({
        userTransferAuthority: userAuthority,
        vault,
        vaultAssetMint,
        assetTokenProgram,
      })
      .instruction();
  }

  /**
   * Creates a withdraw instruction
   *
   * @param amount - Amount of LP tokens to withdraw
   * @param {Object} params - Withdraw parameters
   * @param {PublicKey} params.userAuthority - Public key of the user authority
   * @param {PublicKey} params.vault - Public key of the vault
   * @param {PublicKey} params.vaultAssetMint - Public key of the vault asset mint
   * @param {PublicKey} params.assetTokenProgram - Public key of the asset token program
   * @returns {Promise<TransactionInstruction>} Transaction instruction for withdrawal
   *
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * const ix = await client.createWithdrawIx(
   *   new BN('1000000000'),
   *   {
   *     userAuthority: userPubkey,
   *     vault: vaultPubkey,
   *     vaultAssetMint: mintPubkey,
   *     assetTokenProgram: tokenProgramPubkey
   *   }
   * );
   */
  async createWithdrawIx(
    amount: BN,
    {
      userAuthority,
      vault,
      vaultAssetMint,
      assetTokenProgram,
    }: {
      userAuthority: PublicKey;
      vault: PublicKey;
      vaultAssetMint: PublicKey;
      assetTokenProgram: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .withdraw(amount)
      .accounts({
        userTransferAuthority: userAuthority,
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
   *   adaptorProgram: adaptorProgramPubkey
   * });
   * ```
   */
  async createAddAdaptorIx({
    vault,
    payer,
    adaptorProgram = DEFAULT_ADAPTOR_PROGRAM_ID,
  }: {
    vault: PublicKey;
    payer: PublicKey;
    adaptorProgram?: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .addAdaptor()
      .accounts({
        payer,
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
   *     adaptorProgram: adaptorProgramPubkey
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
      adaptorProgram = DEFAULT_ADAPTOR_PROGRAM_ID,
    }: {
      payer: PublicKey;
      vault: PublicKey;
      manager: PublicKey;
      strategy: PublicKey;
      adaptorProgram?: PublicKey;
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
      .instruction();
  }

  /**
   * Creates an instruction to deposit assets into a strategy
   *
   * @param {Object} depositArgs - Deposit arguments
   * @param {BN} depositArgs.depositAmount - Amount of assets to deposit
   * @param {Buffer | null} [depositArgs.instructionDiscriminator] - Optional discriminator for the instruction
   * @param {Buffer | null} [depositArgs.additionalArgs] - Optional additional arguments for the instruction
   * @param {Object} params - Strategy deposit parameters
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
    }: depositStrategyArgs,
    {
      vault,
      vaultAssetMint,
      strategy,
      assetTokenProgram,
      adaptorProgram = DEFAULT_ADAPTOR_PROGRAM_ID,
      remainingAccounts,
    }: {
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
   * @param {Object} withdrawArgs - Withdrawal arguments
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
    }: withdrawStrategyArgs,
    {
      vault,
      vaultAssetMint,
      strategy,
      assetTokenProgram,
      adaptorProgram = DEFAULT_ADAPTOR_PROGRAM_ID,
      remainingAccounts,
    }: {
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
   * @param {PublicKey} params.adaptorProgram - Public key of the adaptor program
   * @returns {Promise<TransactionInstruction>} Transaction instruction for removing strategy from vault
   * @throws {Error} If instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createRemoveStrategyIx({
   *   vault: vaultPubkey,
   *   adaptorProgram: adaptorProgramPubkey
   * });
   * ```
   */
  async createRemoveStrategyIx({
    vault,
    adaptorProgram = DEFAULT_ADAPTOR_PROGRAM_ID,
  }: {
    vault: PublicKey;
    adaptorProgram?: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .removeAdaptor()
      .accounts({
        vault,
        adaptorProgram,
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

  // --------------------------------------- Account Fetching

  /**
   * Fetches a vault account's data
   * @param vault - Public key of the vault
   * @returns Promise resolving to the vault account data
   */
  async fetchVaultAccount(vault: PublicKey) {
    return await this.vaultProgram.account.vault.fetch(vault);
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
      strategyInitReceipt
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
      adaptorAddReceipt
    );
  }

  // --------------------------------------- Helpers

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
    const vault = await this.fetchVaultAccount(vaultPk);
    const totalValue = vault.asset.totalValue;

    const lpMint = this.findVaultLpMint(vaultPk);
    const lp = await getMint(this.conn, lpMint);
    const lpSupply = new BN(lp.supply.toString());

    // Validate inputs
    if (lpSupply <= new BN(0)) throw new Error("Invalid LP supply");
    if (totalValue <= new BN(0)) throw new Error("Invalid total assets");

    // Calculate: (lpAmount * totalValue) / totalLpSupply
    try {
      return lpAmount.mul(totalValue).div(lpSupply);
    } catch (e) {
      throw new Error("Math overflow in asset calculation");
    }
  }

  /**
   * Calculates the amount of LP tokens that would be received for a given asset deposit
   *
   * @param depositAmount - Amount of assets to deposit
   * @param vaultPk - Public key of the vault
   * @returns Promise resolving to the amount of LP tokens that would be received
   *
   * @throws {Error} If math overflow occurs during calculation
   *
   * @example
   * ```typescript
   * const lpTokens = await client.calculateLpTokensForDeposit(
   *   new BN('1000000000'),
   *   vaultPubkey
   * );
   * ```
   */
  async calculateLpTokensForDeposit(
    depositAmount: BN,
    vaultPk: PublicKey
  ): Promise<BN> {
    const vault = await this.fetchVaultAccount(vaultPk);
    const totalValue = vault.asset.totalValue;
    const lpMint = this.findVaultLpMint(vaultPk);
    const lp = await getMint(this.conn, lpMint);
    const lpSupply = new BN(lp.supply.toString());

    // If the pool is empty, mint LP tokens 1:1 with deposit
    if (totalValue <= new BN(0) && lpSupply <= new BN(0)) {
      const assetMint = await getMint(this.conn, vault.asset.mint);
      const assetDecimals = assetMint.decimals;
      const lpDecimals = lp.decimals;
      return depositAmount
        .mul(new BN(10 ** lpDecimals))
        .div(new BN(10 ** assetDecimals));
    }

    // Calculate: (depositAmount * totalLpSupply) / totalValue
    try {
      return depositAmount.mul(lpSupply).div(totalValue);
    } catch (e) {
      throw new Error("Math overflow in LP token calculation");
    }
  }
}
