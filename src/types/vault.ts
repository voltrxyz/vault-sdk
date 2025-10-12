import { BN } from "@coral-xyz/anchor";

export interface VaultConfig {
  maxCap: BN;
  startAtTs: BN;
  lockedProfitDegradationDuration: BN;
  managerManagementFee: number;
  managerPerformanceFee: number;
  adminManagementFee: number;
  adminPerformanceFee: number;
  redemptionFee: number;
  issuanceFee: number;
  withdrawalWaitingPeriod: BN;
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

export interface DepositStrategyArgs extends InitializeStrategyArgs {
  depositAmount: BN;
}

export interface WithdrawStrategyArgs extends InitializeStrategyArgs {
  withdrawAmount: BN;
}

export interface InitializeDirectWithdrawStrategyArgs
  extends InitializeStrategyArgs {
  allowUserArgs?: boolean;
}

export interface RequestWithdrawVaultArgs {
  amount: BN;
  isAmountInLp: boolean;
  isWithdrawAll: boolean;
}

export enum VaultConfigField {
  MaxCap = "maxCap",
  StartAtTs = "startAtTs",
  LockedProfitDegradationDuration = "lockedProfitDegradationDuration",
  WithdrawalWaitingPeriod = "withdrawalWaitingPeriod",
  ManagerPerformanceFee = "managerPerformanceFee",
  AdminPerformanceFee = "adminPerformanceFee",
  ManagerManagementFee = "managerManagementFee",
  AdminManagementFee = "adminManagementFee",
  RedemptionFee = "redemptionFee",
  IssuanceFee = "issuanceFee",
  Manager = "manager",
}
