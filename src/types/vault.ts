import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export interface VaultConfig {
  managementFee: number;
  performanceFee: number;
  maxCap: BN;
}

export interface VaultParams {
  config: VaultConfig;
  name: string;
  description: string;
}

export interface VaultAsset {
  assetMint: PublicKey;
  idleAta: PublicKey;
  totalAmount: BN;
}

export interface VaultLp {
  lpMint: PublicKey;
  feeAta: PublicKey;
}

export interface Vault {
  name: number[];
  description: number[];
  asset: VaultAsset;
  lp: VaultLp;
  manager: PublicKey;
  admin: PublicKey;
  configuration: VaultConfig;
  lastUpdateSlot: BN;
}
