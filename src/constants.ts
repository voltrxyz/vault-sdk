import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export const VAULT_PROGRAM_ID = new PublicKey(
  "vVoLTRjQmtFpiYoegx285Ze4gsLJ8ZxgFKVcuvmG1a8"
);

export const LENDING_ADAPTOR_PROGRAM_ID = new PublicKey(
  "aVoLTRCRt3NnnchvLYH6rMYehJHwM5m45RmLBZq7PGz"
);

export const DRIFT_ADAPTOR_PROGRAM_ID = new PublicKey(
  "EBN93eXs5fHGBABuajQqdsKRkCgaqtJa8vEFD6vKXiP"
);

export const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const SEEDS = {
  PROTOCOL: Buffer.from("protocol"),
  VAULT_LP_MINT: Buffer.from("vault_lp_mint"),
  VAULT_LP_MINT_AUTH: Buffer.from("vault_lp_mint_auth"),
  VAULT_ASSET_IDLE_AUTH: Buffer.from("vault_asset_idle_auth"),
  ADAPTOR_ADD_RECEIPT: Buffer.from("adaptor_add_receipt"),
  STRATEGY_INIT_RECEIPT: Buffer.from("strategy_init_receipt"),
  VAULT_STRATEGY_AUTH: Buffer.from("vault_strategy_auth"),
  VAULT_STRATEGY: Buffer.from("vault_strategy"),
  DIRECT_WITHDRAW_INIT_RECEIPT_SEED: Buffer.from(
    "direct_withdraw_init_receipt"
  ),
  REQUEST_WITHDRAW_VAULT_RECEIPT: Buffer.from("request_withdraw_vault_receipt"),
  // TODO: Remove this
  STRATEGY: Buffer.from("strategy"),
  METADATA: Buffer.from("metadata"),
};

export const ONE_YEAR_BN = new BN(365 * 24 * 60 * 60);
export const MAX_FEE_BPS_BN = new BN(10_000);
