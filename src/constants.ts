import { PublicKey } from "@solana/web3.js";

export const VAULT_PROGRAM_ID = new PublicKey(
  "vVoLTRjQmtFpiYoegx285Ze4gsLJ8ZxgFKVcuvmG1a8"
);

export const DEFAULT_ADAPTOR_PROGRAM_ID = new PublicKey(
  "aVoLTRCRt3NnnchvLYH6rMYehJHwM5m45RmLBZq7PGz"
);

export const REDEMPTION_FEE_PERCENTAGE_BPS = 10;

export const SEEDS = {
  VAULT_LP_MINT: Buffer.from("vault_lp_mint"),
  VAULT_ASSET_IDLE_AUTH: Buffer.from("vault_asset_idle_auth"),
  STRATEGY: Buffer.from("strategy"),
  STRATEGY_INIT_RECEIPT: Buffer.from("strategy_init_receipt"),
  VAULT_STRATEGY_AUTH: Buffer.from("vault_strategy_auth"),
  DIRECT_WITHDRAW_INIT_RECEIPT_SEED: Buffer.from(
    "direct_withdraw_init_receipt"
  ),
};
