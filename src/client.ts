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

import { SEEDS } from "./constants";
import { VaultParams, VoltrVault, VoltrAdaptor } from "./types";

// Import IDL files
import * as vaultIdl from "./idl/voltr_vault.json";
import * as adaptorIdl from "./idl/voltr_adaptor.json";

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

  async getBalance(publicKey: PublicKey): Promise<number> {
    return this.conn.getBalance(publicKey);
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
 * import { VoltrClient } from 'voltr-sdk';
 * import { Connection } from '@solana/web3.js';
 *
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const client = new VoltrClient(connection);
 * ```
 */
export class VoltrClient extends AccountUtils {
  provider!: AnchorProvider;
  vaultProgram!: Program<VoltrVault>;
  adaptorProgram!: Program<VoltrAdaptor>;
  vaultIdl!: Idl;
  adaptorIdl!: Idl;

  /**
   * Creates a new VoltrClient instance
   * @param conn - Solana connection instance
   * @param wallet - Optional keypair for signing transactions
   */
  constructor(conn: Connection, wallet?: Keypair) {
    super(conn);

    // Initialize programs
    this.setProvider(wallet);
    this.setPrograms(vaultIdl as any, adaptorIdl as any);
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

  private setPrograms(vaultIdl?: Idl, adaptorIdl?: Idl) {
    this.vaultProgram = new Program<VoltrVault>(vaultIdl as any, this.provider);
    this.adaptorProgram = new Program<VoltrAdaptor>(
      adaptorIdl as any,
      this.provider
    );
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
   * Finds the strategy PDA for a given counterparty asset token account
   * @param counterpartyAssetTa - Public key of the counterparty asset token account
   * @returns The PDA for the strategy account
   *
   * @example
   * ```typescript
   * const strategy = client.findStrategy(counterpartyAssetTaPubkey);
   * ```
   */
  findStrategy(counterpartyAssetTa: PublicKey) {
    const [strategy] = PublicKey.findProgramAddressSync(
      [SEEDS.STRATEGY, counterpartyAssetTa.toBuffer()],
      this.adaptorProgram.programId
    );
    return strategy;
  }

  /**
   * Finds the adaptor strategy PDA for a given vault and strategy
   * @param vault - Public key of the vault
   * @param strategy - Public key of the strategy
   * @returns The PDA for the adaptor strategy account
   *
   * @example
   * ```typescript
   * const adaptorStrategy = client.findAdaptorStrategy(vaultPubkey, strategyPubkey);
   * ```
   */
  findAdaptorStrategy(vault: PublicKey, strategy: PublicKey) {
    const [adaptorStrategy] = PublicKey.findProgramAddressSync(
      [SEEDS.ADAPTOR_STRATEGY, vault.toBuffer(), strategy.toBuffer()],
      this.vaultProgram.programId
    );
    return adaptorStrategy;
  }

  /**
   * Finds the vault strategy PDA for a given vault and strategy
   * @param vaultAssetIdleAuth - Public key of the vault's asset idle authority
   * @param strategy - Public key of the strategy
   * @returns The PDA for the vault strategy account
   */
  findVaultStrategy(vaultAssetIdleAuth: PublicKey, strategy: PublicKey) {
    const [vaultStrategy] = PublicKey.findProgramAddressSync(
      [
        SEEDS.VAULT_STRATEGY,
        vaultAssetIdleAuth.toBuffer(),
        strategy.toBuffer(),
      ],
      this.adaptorProgram.programId
    );
    return vaultStrategy;
  }

  /**
   * Finds all strategy-related addresses
   * @param vault - Public key of the vault
   * @param vaultAssetIdleAuth - Public key of the vault's asset idle authority
   * @param counterpartyAssetTa - Public key of the counterparty asset token account
   * @returns Object containing all strategy-related PDAs
   */
  findStrategyAddresses(
    vault: PublicKey,
    vaultAssetIdleAuth: PublicKey,
    counterpartyAssetTa: PublicKey
  ) {
    const strategy = this.findStrategy(counterpartyAssetTa);
    const adaptorStrategy = this.findAdaptorStrategy(vault, strategy);
    const vaultStrategy = this.findVaultStrategy(vaultAssetIdleAuth, strategy);

    return {
      strategy,
      adaptorStrategy,
      vaultStrategy,
    };
  }

  // --------------------------------------- Vault Instructions
  /**
   * Creates an instruction to initialize a new vault
   *
   * @param params - Parameters for initializing the vault
   * @returns Promise resolving to a TransactionInstruction
   *
   * @example
   * ```typescript
   * const ix = await client.createInitializeVaultIx({
   *   vault: vaultKeypair,
   *   vaultAssetMint: new PublicKey('...'),
   *   admin: adminPubkey,
   *   manager: managerPubkey,
   *   payer: payerPubkey,
   *   vaultParams: {
   *     config: {
   *       managementFee: 50, // 0.5%
   *       performanceFee: 1000, // 10%
   *       maxCap: new BN('1000000000')
   *     },
   *     name: "My Vault",
   *     description: "Example vault"
   *   }
   * });
   * ```
   */
  async createInitializeVaultIx({
    vault,
    vaultAssetMint,
    admin,
    manager,
    payer,
    vaultParams,
  }: {
    vault: Keypair;
    vaultAssetMint: PublicKey;
    admin: PublicKey;
    manager: PublicKey;
    payer: PublicKey;
    vaultParams: VaultParams;
  }): Promise<TransactionInstruction> {
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
   * @param amount - Amount of tokens to deposit
   * @param params - Deposit parameters
   * @returns Promise resolving to a TransactionInstruction
   *
   * @example
   * ```typescript
   * const ix = await client.createDepositIx(
   *   new BN('1000000000'),
   *   {
   *     userAuthority: userPubkey,
   *     vault: vaultPubkey,
   *     vaultAssetMint: mintPubkey
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
    }: {
      userAuthority: PublicKey;
      vault: PublicKey;
      vaultAssetMint: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    const { vaultLpMint } = this.findVaultAddresses(vault);

    return await this.vaultProgram.methods
      .deposit(amount)
      .accounts({
        userTransferAuthority: userAuthority,
        vault,
        vaultAssetMint,
        vaultLpMint,
        assetTokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
  }

  /**
   * Creates a withdraw instruction
   *
   * @param amount - Amount of LP tokens to withdraw
   * @param params - Withdraw parameters
   * @returns Promise resolving to a TransactionInstruction
   *
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createWithdrawIx(
   *   new BN('1000000000'),
   *   {
   *     userAuthority: userPubkey,
   *     vault: vaultPubkey,
   *     vaultAssetMint: mintPubkey
   *   }
   * );
   * ```
   */
  async createWithdrawIx(
    amount: BN,
    {
      userAuthority,
      vault,
      vaultAssetMint,
    }: {
      userAuthority: PublicKey;
      vault: PublicKey;
      vaultAssetMint: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    const { vaultLpMint } = this.findVaultAddresses(vault);

    return await this.vaultProgram.methods
      .withdraw(amount)
      .accounts({
        userTransferAuthority: userAuthority,
        vault,
        vaultAssetMint,
        vaultLpMint,
        assetTokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
  }

  // --------------------------------------- Strategy Instructions
  /**
   * Creates an instruction to initialize a new strategy
   *
   * @param strategyType - Type of strategy to create (marginfi or kamino or drift or solend)
   * @param params - Strategy initialization parameters
   * @returns Promise resolving to a TransactionInstruction
   *
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createStrategyIx(
   *   { marginfi: {} },
   *   {
   *     payer: payerPubkey,
   *     admin: adminPubkey,
   *     counterpartyAssetTa: taPubkey,
   *     protocolProgram: programPubkey
   *   }
   * );
   * ```
   */
  async createStrategyIx(
    strategyType:
      | { marginfi: Record<string, never> }
      | { kamino: Record<string, never> }
      | { solend: Record<string, never> }
      | { driftx: Record<string, never> },
    {
      payer,
      admin,
      counterpartyAssetTa,
      protocolProgram,
    }: {
      payer: PublicKey;
      admin: PublicKey;
      counterpartyAssetTa: PublicKey;
      protocolProgram: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    return await this.adaptorProgram.methods
      .createStrategy(strategyType)
      .accounts({
        payer,
        admin,
        counterpartyAssetTa,
        protocolProgram,
      })
      .instruction();
  }

  /**
   * Creates an instruction to add a strategy to a vault
   *
   * @param params - Parameters for adding strategy to vault
   * @returns Promise resolving to a TransactionInstruction
   *
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.addStrategyToVaultIx({
   *   payer: payerPubkey,
   *   vault: vaultPubkey,
   *   strategy: strategyPubkey
   * });
   * ```
   */
  async addStrategyToVaultIx({
    payer,
    vault,
    strategy,
  }: {
    payer: PublicKey;
    vault: PublicKey;
    strategy: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .addStrategy()
      .accounts({
        payer,
        vault,
        strategy,
        adaptorProgram: this.adaptorProgram.programId,
      })
      .instruction();
  }

  /**
   * Creates an instruction to deposit assets into a strategy
   *
   * @param amount - Amount of assets to deposit
   * @param params - Strategy deposit parameters
   * @returns Promise resolving to a TransactionInstruction
   *
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createDepositStrategyIx(
   *   new BN('1000000000'),
   *   {
   *     vault: vaultPubkey,
   *     vaultAssetMint: mintPubkey,
   *     strategy: strategyPubkey,
   *     vaultStrategy: vaultStrategyPubkey,
   *     counterpartyAssetTa: taPubkey,
   *     remainingAccounts: []
   *   }
   * );
   * ```
   */
  async createDepositStrategyIx(
    amount: BN,
    {
      vault,
      vaultAssetMint,
      strategy,
      vaultStrategy,
      counterpartyAssetTa,
      protocolProgram,
      remainingAccounts,
    }: {
      vault: PublicKey;
      vaultAssetMint: PublicKey;
      strategy: PublicKey;
      vaultStrategy: PublicKey;
      counterpartyAssetTa: PublicKey;
      protocolProgram: PublicKey;
      remainingAccounts: Array<{
        pubkey: PublicKey;
        isSigner: boolean;
        isWritable: boolean;
      }>;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .depositStrategy(amount)
      .accounts({
        vault,
        vaultAssetMint,
        adaptorProgram: this.adaptorProgram.programId,
        strategy,
        vaultStrategy,
        counterpartyAssetTa,
        assetTokenProgram: TOKEN_PROGRAM_ID,
        lpTokenProgram: TOKEN_PROGRAM_ID,
        protocolProgram,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();
  }

  /**
   * Creates an instruction to withdraw assets from a strategy
   *
   * @param amount - Amount of assets to withdraw
   * @param params - Strategy withdrawal parameters
   * @returns Promise resolving to a TransactionInstruction
   *
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createWithdrawStrategyIx(
   *   new BN('1000000000'),
   *   {
   *     vault: vaultPubkey,
   *     vaultAssetMint: mintPubkey,
   *     strategy: strategyPubkey,
   *     vaultStrategy: vaultStrategyPubkey,
   *     counterpartyAssetTa: taPubkey,
   *     counterpartyAssetTaAuth: taAuthPubkey,
   *     remainingAccounts: []
   *   }
   * );
   * ```
   */
  async createWithdrawStrategyIx(
    amount: BN,
    {
      vault,
      vaultAssetMint,
      strategy,
      vaultStrategy,
      counterpartyAssetTa,
      counterpartyAssetTaAuth,
      protocolProgram,
      remainingAccounts,
    }: {
      vault: PublicKey;
      vaultAssetMint: PublicKey;
      strategy: PublicKey;
      vaultStrategy: PublicKey;
      counterpartyAssetTa: PublicKey;
      counterpartyAssetTaAuth: PublicKey;
      protocolProgram: PublicKey;
      remainingAccounts: Array<{
        pubkey: PublicKey;
        isSigner: boolean;
        isWritable: boolean;
      }>;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .withdrawStrategy(amount)
      .accounts({
        vault,
        vaultAssetMint,
        adaptorProgram: this.adaptorProgram.programId,
        strategy,
        vaultStrategy,
        counterpartyAssetTa,
        counterpartyAssetTaAuth,
        assetTokenProgram: TOKEN_PROGRAM_ID,
        lpTokenProgram: TOKEN_PROGRAM_ID,
        protocolProgram,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();
  }

  /**
   * Creates an instruction to remove a strategy from a vault
   *
   * @param params - Parameters for removing strategy
   * @returns Promise resolving to a TransactionInstruction
   *
   * @throws {Error} If the instruction creation fails
   *
   * @example
   * ```typescript
   * const ix = await client.createRemoveStrategyIx({
   *   admin: adminPubkey,
   *   vault: vaultPubkey,
   *   strategy: strategyPubkey
   * });
   * ```
   */
  async createRemoveStrategyIx({
    vault,
    strategy,
  }: {
    admin: PublicKey;
    vault: PublicKey;
    strategy: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .removeStrategy()
      .accounts({
        vault,
        strategy,
      })
      .instruction();
  }

  // --------------------------------------- Account Fetching All

  /**
   * Fetches all strategy accounts
   * @returns Promise resolving to an array of strategy accounts
   *
   * @example
   * ```typescript
   * const strategyAccounts = await client.fetchAllStrategyAccounts();
   * ```
   */
  async fetchAllStrategyAccounts() {
    return await this.adaptorProgram.account.strategy.all();
  }

  /**
   * Fetches all vault strategy accounts
   * @param vaultAssetIdleAuth - Public key of the vault asset idle auth
   * @returns Promise resolving to an array of vault strategy accounts
   *
   * @example
   * ```typescript
   * const vaultStrategyAccounts = await client.fetchVaultStrategyAccounts(vaultAssetIdleAuthPubkey);
   * ```
   */
  async fetchVaultStrategyAccounts(vaultAssetIdleAuth: PublicKey) {
    return await this.adaptorProgram.account.vaultStrategy.all([
      {
        memcmp: {
          offset: 8, // 8 for discriminator
          bytes: vaultAssetIdleAuth.toBase58(),
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
    return await this.vaultProgram.account.vault.fetch(vault);
  }

  /**
   * Fetches a strategy account's data
   * @param strategy - Public key of the strategy
   * @returns Promise resolving to the strategy account data
   *
   * @example
   * ```typescript
   * const strategyAccount = await client.fetchStrategyAccount(strategyPubkey);
   * ```
   */
  async fetchStrategyAccount(strategy: PublicKey) {
    return await this.adaptorProgram.account.strategy.fetch(strategy);
  }

  /**
   * Fetches a vault strategy account's data
   * @param vaultStrategy - Public key of the vault strategy account
   * @returns Promise resolving to the vault strategy account data
   *
   * @example
   * ```typescript
   * const vaultStrategyAccount = await client.fetchVaultStrategyAccount(vaultStrategyPubkey);
   * ```
   */
  async fetchVaultStrategyAccount(vaultStrategy: PublicKey) {
    return await this.adaptorProgram.account.vaultStrategy.fetch(vaultStrategy);
  }

  /**
   * Fetches an adaptor strategy account's data
   * @param adaptorStrategy - Public key of the adaptor strategy account
   * @returns Promise resolving to the adaptor strategy account data
   *
   * @example
   * ```typescript
   * const adaptorStrategyAccount = await client.fetchAdaptorStrategyAccount(adaptorStrategyPubkey);
   * ```
   */
  async fetchAdaptorStrategyAccount(adaptorStrategy: PublicKey) {
    return await this.vaultProgram.account.adaptorStrategy.fetch(
      adaptorStrategy
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
    const totalAssets = vault.asset.totalAmount;

    const lpMint = this.findVaultLpMint(vaultPk);
    const lp = await getMint(this.conn, lpMint);
    const lpSupply = new BN(lp.supply.toString());

    // Validate inputs
    if (lpSupply <= new BN(0)) throw new Error("Invalid LP supply");
    if (totalAssets <= new BN(0)) throw new Error("Invalid total assets");

    // Calculate: (lpAmount * totalAssets) / totalLpSupply
    try {
      return lpAmount.mul(totalAssets).div(lpSupply);
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
    const totalAssets = vault.asset.totalAmount;
    const lpMint = this.findVaultLpMint(vaultPk);
    const lp = await getMint(this.conn, lpMint);
    const lpSupply = new BN(lp.supply.toString());

    // If the pool is empty, mint LP tokens 1:1 with deposit
    if (totalAssets <= new BN(0) && lpSupply <= new BN(0)) {
      return depositAmount;
    }

    // Calculate: (depositAmount * totalLpSupply) / totalAssets
    try {
      return depositAmount.mul(lpSupply).div(totalAssets);
    } catch (e) {
      throw new Error("Math overflow in LP token calculation");
    }
  }
}
