import { PublicKey } from "@solana/web3.js";

export const VAULT_PROGRAM_ID = new PublicKey(
  "EwAei87GBsgeLueC7mShT2TNbH3BYumP4RskusxUFBn6"
);

export const ADAPTOR_PROGRAM_ID = new PublicKey(
  "3BufioDyECNwuFJLRGCXNbZFrsnJnCsALMfDKjQEnk8x"
);

export const SEEDS = {
  VAULT_LP_MINT: Buffer.from("vault_lp_mint"),
  VAULT_LP_FEE_AUTH: Buffer.from("vault_lp_fee_auth"),
  VAULT_ASSET_IDLE_AUTH: Buffer.from("vault_asset_idle_auth"),
  ADAPTOR_STRATEGY: Buffer.from("adaptor_strategy"),
  VAULT_STRATEGY: Buffer.from("vault_strategy"),
  STRATEGY: Buffer.from("strategy"),
};