import { BN } from "@coral-xyz/anchor";

export interface VaultConfig {
  maxCap: BN;
  startAtTs: BN;
  managerManagementFee: number;
  managerPerformanceFee: number;
  adminManagementFee: number;
  adminPerformanceFee: number;
}

export interface VaultParams {
  config: VaultConfig;
  name: string;
  description: string;
}

export interface InitializeStrategyArgs {
  instructionDiscriminator?: Buffer | null;
  additionalArgs?: Buffer | null;
}

export interface depositStrategyArgs extends InitializeStrategyArgs {
  depositAmount: BN;
}

export interface withdrawStrategyArgs extends InitializeStrategyArgs {
  withdrawAmount: BN;
}
