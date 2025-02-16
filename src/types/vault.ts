import { BN } from "@coral-xyz/anchor";

export interface VaultConfig {
  maxCap: BN;
  startAtTs: BN;
  lockedProfitDegradationDuration: BN;
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

export interface WithdrawVaultArgs {
  amount: BN;
  isAmountInLp: boolean;
  isWithdrawAll: boolean;
}

export interface DirectWithdrawStrategyArgs extends WithdrawVaultArgs {
  userArgs?: Buffer | null;
}
