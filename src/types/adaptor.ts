import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export enum StrategyType {
  Solend = "solend",
  Drift = "drift",
  Marginfi = "marginfi",
  Kamino = "kamino",
}

export interface Strategy {
  counterpartyAssetTa: PublicKey;
  protocolProgram: PublicKey;
  strategyType: StrategyType;
}

export interface VaultStrategy {
  vaultAssetIdleAuth: PublicKey;
  strategy: PublicKey;
  currentAmount: BN;
}
