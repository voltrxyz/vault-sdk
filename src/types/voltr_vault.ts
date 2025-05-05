/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/voltr_vault.json`.
 */
export type VoltrVault = {
  "address": "vVoLTRjQmtFpiYoegx285Ze4gsLJ8ZxgFKVcuvmG1a8",
  "metadata": {
    "name": "voltrVault",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addAdaptor",
      "discriminator": [
        161,
        145,
        203,
        248,
        211,
        202,
        203,
        67
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "vault"
          ]
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "adaptorAddReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  97,
                  112,
                  116,
                  111,
                  114,
                  95,
                  97,
                  100,
                  100,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "adaptorProgram"
              }
            ]
          }
        },
        {
          "name": "adaptorProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "cancelRequestWithdrawVault",
      "discriminator": [
        231,
        54,
        14,
        6,
        223,
        124,
        127,
        238
      ],
      "accounts": [
        {
          "name": "userTransferAuthority",
          "docs": [
            "The authority that owns the LP tokens and wants to redeem them"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "vaultLpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "userLpAta",
          "docs": [
            "The user's LP token account from which LP tokens will be burned."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "userTransferAuthority"
              },
              {
                "kind": "account",
                "path": "lpTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultLpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "requestWithdrawLpAta",
          "docs": [
            "The request's associated token account for LP."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "requestWithdrawVaultReceipt"
              },
              {
                "kind": "account",
                "path": "lpTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultLpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "requestWithdrawVaultReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  119,
                  105,
                  116,
                  104,
                  100,
                  114,
                  97,
                  119,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "userTransferAuthority"
              }
            ]
          }
        },
        {
          "name": "lpTokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeStrategy",
      "discriminator": [
        56,
        247,
        170,
        246,
        89,
        221,
        134,
        200
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "manager",
          "signer": true
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault"
        },
        {
          "name": "strategy"
        },
        {
          "name": "strategyInitReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  105,
                  110,
                  105,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createLpMetadata",
      "discriminator": [
        148,
        193,
        160,
        116,
        87,
        25,
        123,
        103
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "vault"
          ]
        },
        {
          "name": "vault"
        },
        {
          "name": "vaultLpMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "vaultLpMintAuth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "metadataAccount",
          "writable": true
        },
        {
          "name": "metadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "depositStrategy",
      "discriminator": [
        246,
        82,
        57,
        226,
        131,
        222,
        253,
        249
      ],
      "accounts": [
        {
          "name": "manager",
          "signer": true
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "strategy"
        },
        {
          "name": "adaptorAddReceipt",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  97,
                  112,
                  116,
                  111,
                  114,
                  95,
                  97,
                  100,
                  100,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "adaptorProgram"
              }
            ]
          }
        },
        {
          "name": "strategyInitReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  105,
                  110,
                  105,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "vaultAssetIdleAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  115,
                  115,
                  101,
                  116,
                  95,
                  105,
                  100,
                  108,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "vaultStrategyAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "vaultAssetMint",
          "writable": true
        },
        {
          "name": "vaultLpMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "vaultAssetIdleAta",
          "docs": [
            "The vault's associated token account for asset."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vaultAssetIdleAuth"
              },
              {
                "kind": "account",
                "path": "assetTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultAssetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultStrategyAssetAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vaultStrategyAuth"
              },
              {
                "kind": "account",
                "path": "assetTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultAssetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "assetTokenProgram"
        },
        {
          "name": "adaptorProgram"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "instructionDiscriminator",
          "type": {
            "option": "bytes"
          }
        },
        {
          "name": "additionalArgs",
          "type": {
            "option": "bytes"
          }
        }
      ]
    },
    {
      "name": "depositVault",
      "discriminator": [
        126,
        224,
        21,
        255,
        228,
        53,
        117,
        33
      ],
      "accounts": [
        {
          "name": "userTransferAuthority",
          "signer": true
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "vaultAssetMint"
        },
        {
          "name": "vaultLpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "userAssetAta",
          "docs": [
            "The user's asset ATA from which they are depositing tokens."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "userTransferAuthority"
              },
              {
                "kind": "account",
                "path": "assetTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultAssetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultAssetIdleAta",
          "docs": [
            "The vault's associated token account for asset."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vaultAssetIdleAuth"
              },
              {
                "kind": "account",
                "path": "assetTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultAssetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultAssetIdleAuth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  115,
                  115,
                  101,
                  116,
                  95,
                  105,
                  100,
                  108,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "userLpAta",
          "docs": [
            "The user's LP ATA where we will mint LP tokens."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "userTransferAuthority"
              },
              {
                "kind": "account",
                "path": "lpTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultLpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultLpMintAuth",
          "docs": [
            "The PDA authority used to sign mint instructions for LP tokens."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "assetTokenProgram"
        },
        {
          "name": "lpTokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "directWithdrawStrategy",
      "discriminator": [
        119,
        33,
        54,
        52,
        194,
        8,
        211,
        239
      ],
      "accounts": [
        {
          "name": "userTransferAuthority",
          "docs": [
            "The authority that owns the LP tokens and wants to redeem them"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "adaptorAddReceipt",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  97,
                  112,
                  116,
                  111,
                  114,
                  95,
                  97,
                  100,
                  100,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "adaptorProgram"
              }
            ]
          }
        },
        {
          "name": "strategyInitReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  105,
                  110,
                  105,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "directWithdrawInitReceipt",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  105,
                  114,
                  101,
                  99,
                  116,
                  95,
                  119,
                  105,
                  116,
                  104,
                  100,
                  114,
                  97,
                  119,
                  95,
                  105,
                  110,
                  105,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "strategy"
        },
        {
          "name": "vaultAssetMint",
          "writable": true
        },
        {
          "name": "vaultLpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "requestWithdrawLpAta",
          "docs": [
            "The request's LP token account from which LP tokens will be burned."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "requestWithdrawVaultReceipt"
              },
              {
                "kind": "account",
                "path": "lpTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultLpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultStrategyAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "userAssetAta",
          "docs": [
            "The user's asset ATA to which asset tokens will be sent."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "userTransferAuthority"
              },
              {
                "kind": "account",
                "path": "assetTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultAssetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultStrategyAssetAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vaultStrategyAuth"
              },
              {
                "kind": "account",
                "path": "assetTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultAssetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "requestWithdrawVaultReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  119,
                  105,
                  116,
                  104,
                  100,
                  114,
                  97,
                  119,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "userTransferAuthority"
              }
            ]
          }
        },
        {
          "name": "adaptorProgram"
        },
        {
          "name": "assetTokenProgram"
        },
        {
          "name": "lpTokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userArgs",
          "type": {
            "option": "bytes"
          }
        }
      ]
    },
    {
      "name": "harvestFee",
      "discriminator": [
        32,
        59,
        42,
        128,
        246,
        73,
        255,
        47
      ],
      "accounts": [
        {
          "name": "harvester",
          "signer": true
        },
        {
          "name": "vaultManager"
        },
        {
          "name": "vaultAdmin"
        },
        {
          "name": "protocolAdmin"
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "vaultLpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "vaultLpMintAuth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "vaultManagerLpAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vaultManager"
              },
              {
                "kind": "account",
                "path": "lpTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultLpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultAdminLpAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vaultAdmin"
              },
              {
                "kind": "account",
                "path": "lpTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultLpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "protocolAdminLpAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "protocolAdmin"
              },
              {
                "kind": "account",
                "path": "lpTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultLpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lpTokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "initOrUpdateProtocol",
      "discriminator": [
        149,
        56,
        57,
        46,
        105,
        182,
        61,
        208
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "currentAdmin",
          "signer": true
        },
        {
          "name": "newAdmin"
        },
        {
          "name": "protocol",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "operationalState",
          "type": "u16"
        },
        {
          "name": "fee",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeDirectWithdrawStrategy",
      "discriminator": [
        248,
        207,
        228,
        15,
        13,
        191,
        43,
        58
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "vault"
          ]
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "strategy"
        },
        {
          "name": "strategyInitReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  105,
                  110,
                  105,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "adaptorAddReceipt",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  97,
                  112,
                  116,
                  111,
                  114,
                  95,
                  97,
                  100,
                  100,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "adaptorProgram"
              }
            ]
          }
        },
        {
          "name": "directWithdrawInitReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  105,
                  114,
                  101,
                  99,
                  116,
                  95,
                  119,
                  105,
                  116,
                  104,
                  100,
                  114,
                  97,
                  119,
                  95,
                  105,
                  110,
                  105,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "adaptorProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "instructionDiscriminator",
          "type": {
            "option": "bytes"
          }
        },
        {
          "name": "additionalArgs",
          "type": {
            "option": "bytes"
          }
        },
        {
          "name": "allowUserArgs",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initializeStrategy",
      "discriminator": [
        208,
        119,
        144,
        145,
        178,
        57,
        105,
        252
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "manager",
          "signer": true
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault"
        },
        {
          "name": "strategy"
        },
        {
          "name": "adaptorAddReceipt",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  97,
                  112,
                  116,
                  111,
                  114,
                  95,
                  97,
                  100,
                  100,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "adaptorProgram"
              }
            ]
          }
        },
        {
          "name": "strategyInitReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  105,
                  110,
                  105,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "vaultStrategyAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "adaptorProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "instructionDiscriminator",
          "type": {
            "option": "bytes"
          }
        },
        {
          "name": "additionalArgs",
          "type": {
            "option": "bytes"
          }
        }
      ]
    },
    {
      "name": "initializeVault",
      "discriminator": [
        48,
        191,
        163,
        44,
        71,
        129,
        63,
        164
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "manager"
        },
        {
          "name": "admin"
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultLpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "vaultAssetMint"
        },
        {
          "name": "vaultAssetIdleAta",
          "writable": true
        },
        {
          "name": "vaultLpMintAuth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "vaultAssetIdleAuth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  115,
                  115,
                  101,
                  116,
                  95,
                  105,
                  100,
                  108,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "assetTokenProgram"
        },
        {
          "name": "lpTokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": {
              "name": "vaultInitializationInput"
            }
          }
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "removeAdaptor",
      "discriminator": [
        161,
        199,
        99,
        22,
        25,
        193,
        61,
        193
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "vault"
          ]
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "adaptorAddReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  97,
                  112,
                  116,
                  111,
                  114,
                  95,
                  97,
                  100,
                  100,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "adaptorProgram"
              }
            ]
          }
        },
        {
          "name": "adaptorProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "requestWithdrawVault",
      "discriminator": [
        248,
        225,
        47,
        22,
        116,
        144,
        23,
        143
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "The payer of the request"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "userTransferAuthority",
          "docs": [
            "The authority that owns the LP tokens and wants to redeem them"
          ],
          "signer": true
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault"
        },
        {
          "name": "vaultLpMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "userLpAta",
          "docs": [
            "The user's LP token account from which LP tokens will be burned."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "userTransferAuthority"
              },
              {
                "kind": "account",
                "path": "lpTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultLpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "requestWithdrawLpAta",
          "docs": [
            "The request's associated token account for LP."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "requestWithdrawVaultReceipt"
              },
              {
                "kind": "account",
                "path": "lpTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultLpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "requestWithdrawVaultReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  119,
                  105,
                  116,
                  104,
                  100,
                  114,
                  97,
                  119,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "userTransferAuthority"
              }
            ]
          }
        },
        {
          "name": "lpTokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "isAmountInLp",
          "type": "bool"
        },
        {
          "name": "isWithdrawAll",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateVault",
      "discriminator": [
        67,
        229,
        185,
        188,
        226,
        11,
        210,
        60
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "vault"
          ]
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "config",
          "type": {
            "defined": {
              "name": "vaultInitializationInput"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawStrategy",
      "discriminator": [
        31,
        45,
        162,
        5,
        193,
        217,
        134,
        188
      ],
      "accounts": [
        {
          "name": "manager",
          "signer": true
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "adaptorAddReceipt",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  97,
                  112,
                  116,
                  111,
                  114,
                  95,
                  97,
                  100,
                  100,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "adaptorProgram"
              }
            ]
          }
        },
        {
          "name": "strategyInitReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  105,
                  110,
                  105,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "strategy"
        },
        {
          "name": "adaptorProgram"
        },
        {
          "name": "vaultAssetIdleAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  115,
                  115,
                  101,
                  116,
                  95,
                  105,
                  100,
                  108,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "vaultStrategyAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "vaultAssetMint",
          "writable": true
        },
        {
          "name": "vaultLpMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "vaultAssetIdleAta",
          "docs": [
            "The vault's associated token account for asset."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vaultAssetIdleAuth"
              },
              {
                "kind": "account",
                "path": "assetTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultAssetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultStrategyAssetAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vaultStrategyAuth"
              },
              {
                "kind": "account",
                "path": "assetTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultAssetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "assetTokenProgram"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "instructionDiscriminator",
          "type": {
            "option": "bytes"
          }
        },
        {
          "name": "additionalArgs",
          "type": {
            "option": "bytes"
          }
        }
      ]
    },
    {
      "name": "withdrawVault",
      "discriminator": [
        135,
        7,
        237,
        120,
        149,
        94,
        95,
        7
      ],
      "accounts": [
        {
          "name": "userTransferAuthority",
          "docs": [
            "The authority that owns the LP tokens and wants to redeem them"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "protocol",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "vaultAssetMint"
        },
        {
          "name": "vaultLpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "requestWithdrawLpAta",
          "docs": [
            "The request's LP token account from which LP tokens will be burned."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "requestWithdrawVaultReceipt"
              },
              {
                "kind": "account",
                "path": "lpTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultLpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultAssetIdleAta",
          "docs": [
            "The vault's associated token account for asset."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vaultAssetIdleAuth"
              },
              {
                "kind": "account",
                "path": "assetTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultAssetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultAssetIdleAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  115,
                  115,
                  101,
                  116,
                  95,
                  105,
                  100,
                  108,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ]
          }
        },
        {
          "name": "userAssetAta",
          "docs": [
            "The user's asset ATA to which asset tokens will be sent."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "userTransferAuthority"
              },
              {
                "kind": "account",
                "path": "assetTokenProgram"
              },
              {
                "kind": "account",
                "path": "vaultAssetMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "requestWithdrawVaultReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  119,
                  105,
                  116,
                  104,
                  100,
                  114,
                  97,
                  119,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "userTransferAuthority"
              }
            ]
          }
        },
        {
          "name": "assetTokenProgram"
        },
        {
          "name": "lpTokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "adaptorAddReceipt",
      "discriminator": [
        105,
        99,
        219,
        155,
        77,
        241,
        7,
        119
      ]
    },
    {
      "name": "directWithdrawInitReceipt",
      "discriminator": [
        206,
        77,
        207,
        208,
        25,
        244,
        81,
        172
      ]
    },
    {
      "name": "protocol",
      "discriminator": [
        45,
        39,
        101,
        43,
        115,
        72,
        131,
        40
      ]
    },
    {
      "name": "requestWithdrawVaultReceipt",
      "discriminator": [
        203,
        81,
        223,
        141,
        175,
        108,
        101,
        114
      ]
    },
    {
      "name": "strategyInitReceipt",
      "discriminator": [
        51,
        8,
        192,
        253,
        115,
        78,
        112,
        214
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "events": [
    {
      "name": "addAdaptorEvent",
      "discriminator": [
        24,
        181,
        201,
        148,
        240,
        183,
        235,
        12
      ]
    },
    {
      "name": "cancelRequestWithdrawVaultEvent",
      "discriminator": [
        46,
        165,
        24,
        114,
        1,
        80,
        205,
        136
      ]
    },
    {
      "name": "closeStrategyEvent",
      "discriminator": [
        213,
        95,
        219,
        161,
        17,
        208,
        93,
        255
      ]
    },
    {
      "name": "depositStrategyEvent",
      "discriminator": [
        202,
        201,
        118,
        49,
        29,
        180,
        116,
        170
      ]
    },
    {
      "name": "depositVaultEvent",
      "discriminator": [
        11,
        15,
        7,
        92,
        150,
        100,
        165,
        232
      ]
    },
    {
      "name": "directWithdrawStrategyEvent",
      "discriminator": [
        113,
        202,
        151,
        124,
        137,
        255,
        153,
        101
      ]
    },
    {
      "name": "harvestFeeEvent",
      "discriminator": [
        69,
        48,
        192,
        23,
        232,
        22,
        23,
        30
      ]
    },
    {
      "name": "initProtocolEvent",
      "discriminator": [
        13,
        81,
        183,
        132,
        88,
        43,
        202,
        213
      ]
    },
    {
      "name": "initializeDirectWithdrawStrategyEvent",
      "discriminator": [
        169,
        22,
        57,
        8,
        15,
        73,
        255,
        115
      ]
    },
    {
      "name": "initializeStrategyEvent",
      "discriminator": [
        30,
        233,
        211,
        249,
        83,
        188,
        234,
        152
      ]
    },
    {
      "name": "initializeVaultEvent",
      "discriminator": [
        179,
        75,
        50,
        161,
        191,
        28,
        245,
        107
      ]
    },
    {
      "name": "removeAdaptorEvent",
      "discriminator": [
        155,
        178,
        2,
        29,
        245,
        86,
        246,
        153
      ]
    },
    {
      "name": "requestWithdrawVaultEvent",
      "discriminator": [
        59,
        94,
        26,
        38,
        47,
        131,
        158,
        162
      ]
    },
    {
      "name": "updateProtocolEvent",
      "discriminator": [
        14,
        227,
        204,
        217,
        62,
        46,
        241,
        237
      ]
    },
    {
      "name": "updateVaultEvent",
      "discriminator": [
        123,
        31,
        27,
        189,
        102,
        1,
        121,
        57
      ]
    },
    {
      "name": "withdrawStrategyEvent",
      "discriminator": [
        112,
        45,
        16,
        172,
        170,
        33,
        22,
        212
      ]
    },
    {
      "name": "withdrawVaultEvent",
      "discriminator": [
        196,
        123,
        79,
        215,
        4,
        214,
        20,
        197
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAmount",
      "msg": "Invalid amount provided."
    },
    {
      "code": 6001,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint."
    },
    {
      "code": 6002,
      "name": "invalidTokenAccount",
      "msg": "Invalid token account."
    },
    {
      "code": 6003,
      "name": "invalidAccountInput",
      "msg": "Invalid account input."
    },
    {
      "code": 6004,
      "name": "mathOverflow",
      "msg": "Math overflow."
    },
    {
      "code": 6005,
      "name": "feeExceedsTotalAssetValue",
      "msg": "Fee exceeds total asset value."
    },
    {
      "code": 6006,
      "name": "maxCapExceeded",
      "msg": "Max cap exceeded."
    },
    {
      "code": 6007,
      "name": "vaultNotActive",
      "msg": "Vault not active."
    },
    {
      "code": 6008,
      "name": "managerNotAllowed",
      "msg": "Manager not allowed in remaining."
    },
    {
      "code": 6009,
      "name": "operationNotAllowed",
      "msg": "Operation not allowed."
    },
    {
      "code": 6010,
      "name": "adaptorEpochInvalid",
      "msg": "Adaptor epoch invalid."
    },
    {
      "code": 6011,
      "name": "invalidFeeConfiguration",
      "msg": "Fee configuration invalid."
    },
    {
      "code": 6012,
      "name": "withdrawalNotYetAvailable",
      "msg": "Withdrawal not yet available."
    },
    {
      "code": 6013,
      "name": "invalidInput",
      "msg": "Invalid input."
    }
  ],
  "types": [
    {
      "name": "adaptorAddReceipt",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "docs": [
              "The vault associated with this strategy."
            ],
            "type": "pubkey"
          },
          {
            "name": "adaptorProgram",
            "docs": [
              "The adapter program address."
            ],
            "type": "pubkey"
          },
          {
            "name": "version",
            "docs": [
              "A version number (1 byte)."
            ],
            "type": "u8"
          },
          {
            "name": "bump",
            "docs": [
              "The bump for the adaptor add receipt."
            ],
            "type": "u8"
          },
          {
            "name": "padding0",
            "docs": [
              "7 bytes of padding to align future 8-byte fields on 8-byte boundaries."
            ],
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "lastUpdatedEpoch",
            "docs": [
              "The epoch at which the strategy was last updated."
            ],
            "type": "u64"
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved space for future fields"
            ],
            "type": {
              "array": [
                "u8",
                56
              ]
            }
          }
        ]
      }
    },
    {
      "name": "addAdaptorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "adaptorProgram",
            "type": "pubkey"
          },
          {
            "name": "adaptorAddReceipt",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "cancelRequestWithdrawVaultEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "requestWithdrawVaultReceipt",
            "type": "pubkey"
          },
          {
            "name": "amountLpRefunded",
            "type": "u64"
          },
          {
            "name": "amountLpBurned",
            "type": "u64"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsBefore",
            "type": "u128"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsAfter",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "closeStrategyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "strategy",
            "type": "pubkey"
          },
          {
            "name": "strategyInitReceipt",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "depositStrategyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "strategy",
            "type": "pubkey"
          },
          {
            "name": "strategyInitReceipt",
            "type": "pubkey"
          },
          {
            "name": "adaptorProgram",
            "type": "pubkey"
          },
          {
            "name": "vaultAssetTotalValueBefore",
            "type": "u64"
          },
          {
            "name": "vaultAssetTotalValueAfter",
            "type": "u64"
          },
          {
            "name": "vaultLpSupplyInclFeesBefore",
            "type": "u64"
          },
          {
            "name": "vaultLpSupplyInclFeesAfter",
            "type": "u64"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsBefore",
            "type": "u128"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsAfter",
            "type": "u128"
          },
          {
            "name": "vaultAssetIdleAtaAmountBefore",
            "type": "u64"
          },
          {
            "name": "vaultAssetIdleAtaAmountAfter",
            "type": "u64"
          },
          {
            "name": "strategyPositionValueBefore",
            "type": "u64"
          },
          {
            "name": "strategyPositionValueAfter",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "depositVaultEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "vaultAssetTotalValueBefore",
            "type": "u64"
          },
          {
            "name": "vaultAssetTotalValueAfter",
            "type": "u64"
          },
          {
            "name": "vaultLpSupplyInclFeesBefore",
            "type": "u64"
          },
          {
            "name": "vaultLpSupplyInclFeesAfter",
            "type": "u64"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsBefore",
            "type": "u128"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsAfter",
            "type": "u128"
          },
          {
            "name": "vaultLastUpdatedTs",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "directWithdrawInitReceipt",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "docs": [
              "The vault associated with this strategy."
            ],
            "type": "pubkey"
          },
          {
            "name": "strategy",
            "docs": [
              "The strategy address."
            ],
            "type": "pubkey"
          },
          {
            "name": "adaptorProgram",
            "docs": [
              "The position value."
            ],
            "type": "pubkey"
          },
          {
            "name": "instructionDiscriminator",
            "docs": [
              "The instruction discriminator."
            ],
            "type": "bytes"
          },
          {
            "name": "additionalArgs",
            "docs": [
              "The additional arguments."
            ],
            "type": {
              "option": "bytes"
            }
          },
          {
            "name": "allowUserArgs",
            "docs": [
              "Whether the user args are allowed."
            ],
            "type": "bool"
          },
          {
            "name": "version",
            "docs": [
              "A version number (1 byte)."
            ],
            "type": "u8"
          },
          {
            "name": "bump",
            "docs": [
              "The bump for the strategy init receipt."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "directWithdrawStrategyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "strategy",
            "type": "pubkey"
          },
          {
            "name": "strategyInitReceipt",
            "type": "pubkey"
          },
          {
            "name": "directWithdrawInitReceipt",
            "type": "pubkey"
          },
          {
            "name": "adaptorProgram",
            "type": "pubkey"
          },
          {
            "name": "vaultAssetTotalValueBefore",
            "type": "u64"
          },
          {
            "name": "vaultAssetTotalValueAfter",
            "type": "u64"
          },
          {
            "name": "vaultLpSupplyInclFeesBefore",
            "type": "u64"
          },
          {
            "name": "vaultLpSupplyInclFeesAfter",
            "type": "u64"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsBefore",
            "type": "u128"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsAfter",
            "type": "u128"
          },
          {
            "name": "strategyPositionValueBefore",
            "type": "u64"
          },
          {
            "name": "strategyPositionValueAfter",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "feeConfiguration",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "managerPerformanceFee",
            "docs": [
              "Manager performance fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "adminPerformanceFee",
            "docs": [
              "Admin performance fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "managerManagementFee",
            "docs": [
              "Manager management fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "adminManagementFee",
            "docs": [
              "Admin management fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "redemptionFee",
            "docs": [
              "The redemption fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "issuanceFee",
            "docs": [
              "The issuance fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved bytes for future use."
            ],
            "type": {
              "array": [
                "u8",
                36
              ]
            }
          }
        ]
      }
    },
    {
      "name": "feeState",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "accumulatedLpManagerFees",
            "docs": [
              "The accumulated manager fees in the vault."
            ],
            "type": "u64"
          },
          {
            "name": "accumulatedLpAdminFees",
            "docs": [
              "The accumulated admin fees in the vault."
            ],
            "type": "u64"
          },
          {
            "name": "accumulatedLpProtocolFees",
            "docs": [
              "The accumulated protocol fees in the vault."
            ],
            "type": "u64"
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved bytes for future use."
            ],
            "type": {
              "array": [
                "u8",
                24
              ]
            }
          }
        ]
      }
    },
    {
      "name": "feeUpdate",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lastPerformanceFeeUpdateTs",
            "docs": [
              "The timestamp when the performance fees were last updated."
            ],
            "type": "u64"
          },
          {
            "name": "lastManagementFeeUpdateTs",
            "docs": [
              "The timestamp when the management fees were last updated."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "harvestFeeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "manager",
            "type": "pubkey"
          },
          {
            "name": "amountLpAdminFees",
            "type": "u64"
          },
          {
            "name": "amountLpManagerFees",
            "type": "u64"
          },
          {
            "name": "amountLpProtocolFees",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "highWaterMark",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "highestAssetPerLpDecimalBits",
            "docs": [
              "The highest recorded total asset value per share"
            ],
            "type": "u128"
          },
          {
            "name": "lastUpdatedTs",
            "docs": [
              "The timestamp when the high water mark was last updated"
            ],
            "type": "u64"
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved for future use"
            ],
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "initProtocolEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "operationalState",
            "type": "u16"
          },
          {
            "name": "fee",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "initializeDirectWithdrawStrategyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "strategy",
            "type": "pubkey"
          },
          {
            "name": "strategyInitReceipt",
            "type": "pubkey"
          },
          {
            "name": "adaptorProgram",
            "type": "pubkey"
          },
          {
            "name": "instructionDiscriminator",
            "type": "bytes"
          },
          {
            "name": "additionalArgs",
            "type": "bytes"
          },
          {
            "name": "allowUserArgs",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "initializeStrategyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "strategy",
            "type": "pubkey"
          },
          {
            "name": "strategyInitReceipt",
            "type": "pubkey"
          },
          {
            "name": "adaptorProgram",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "initializeVaultEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "vaultName",
            "type": "string"
          },
          {
            "name": "vaultDescription",
            "type": "string"
          },
          {
            "name": "vaultAssetMint",
            "type": "pubkey"
          },
          {
            "name": "vaultAssetIdleAta",
            "type": "pubkey"
          },
          {
            "name": "vaultLpMint",
            "type": "pubkey"
          },
          {
            "name": "vaultManager",
            "type": "pubkey"
          },
          {
            "name": "vaultAdmin",
            "type": "pubkey"
          },
          {
            "name": "vaultConfigMaxCap",
            "type": "u64"
          },
          {
            "name": "vaultConfigStartAtTs",
            "type": "u64"
          },
          {
            "name": "vaultConfigLockedProfitDegradationDuration",
            "type": "u64"
          },
          {
            "name": "vaultConfigWithdrawalWaitingPeriod",
            "type": "u64"
          },
          {
            "name": "vaultConfigManagerPerformanceFee",
            "type": "u16"
          },
          {
            "name": "vaultConfigAdminPerformanceFee",
            "type": "u16"
          },
          {
            "name": "vaultConfigManagerManagementFee",
            "type": "u16"
          },
          {
            "name": "vaultConfigAdminManagementFee",
            "type": "u16"
          },
          {
            "name": "vaultConfigRedemptionFee",
            "type": "u16"
          },
          {
            "name": "vaultConfigIssuanceFee",
            "type": "u16"
          },
          {
            "name": "vaultLastUpdatedTs",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lockedProfitState",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lastUpdatedLockedProfit",
            "type": "u64"
          },
          {
            "name": "lastReport",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "protocol",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "The admin of the protocol."
            ],
            "type": "pubkey"
          },
          {
            "name": "operationalState",
            "docs": [
              "The operational state of the protocol."
            ],
            "type": "u16"
          },
          {
            "name": "fee",
            "docs": [
              "The fee for the protocol."
            ],
            "type": "u16"
          },
          {
            "name": "bump",
            "docs": [
              "The bump for the protocol."
            ],
            "type": "u8"
          },
          {
            "name": "padding0",
            "docs": [
              "1 byte of padding to align future 8-byte fields on 8-byte boundaries."
            ],
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved space for future fields"
            ],
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "removeAdaptorEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "adaptorProgram",
            "type": "pubkey"
          },
          {
            "name": "adaptorAddReceipt",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "requestWithdrawVaultEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "requestWithdrawVaultReceipt",
            "type": "pubkey"
          },
          {
            "name": "amountLpEscrowed",
            "type": "u64"
          },
          {
            "name": "amountAssetToWithdrawDecimalBits",
            "type": "u128"
          },
          {
            "name": "withdrawableFromTs",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "requestWithdrawVaultReceipt",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amountLpEscrowed",
            "type": "u64"
          },
          {
            "name": "amountAssetToWithdrawDecimalBits",
            "type": "u128"
          },
          {
            "name": "withdrawableFromTs",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "strategyInitReceipt",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "docs": [
              "The vault associated with this strategy."
            ],
            "type": "pubkey"
          },
          {
            "name": "strategy",
            "docs": [
              "The strategy address."
            ],
            "type": "pubkey"
          },
          {
            "name": "adaptorProgram",
            "docs": [
              "The adaptor program address."
            ],
            "type": "pubkey"
          },
          {
            "name": "positionValue",
            "docs": [
              "The position value."
            ],
            "type": "u64"
          },
          {
            "name": "lastUpdatedTs",
            "docs": [
              "The last updated timestamp."
            ],
            "type": "u64"
          },
          {
            "name": "version",
            "docs": [
              "A version number (1 byte)."
            ],
            "type": "u8"
          },
          {
            "name": "bump",
            "docs": [
              "The bump for the strategy init receipt."
            ],
            "type": "u8"
          },
          {
            "name": "vaultStrategyAuthBump",
            "docs": [
              "The bump for the vault strategy auth."
            ],
            "type": "u8"
          },
          {
            "name": "padding0",
            "docs": [
              "6 bytes of padding to align future 8-byte fields on 8-byte boundaries."
            ],
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved space for future fields"
            ],
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "updateProtocolEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "adminBefore",
            "type": "pubkey"
          },
          {
            "name": "adminAfter",
            "type": "pubkey"
          },
          {
            "name": "operationalStateBefore",
            "type": "u16"
          },
          {
            "name": "operationalStateAfter",
            "type": "u16"
          },
          {
            "name": "feeBefore",
            "type": "u16"
          },
          {
            "name": "feeAfter",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "updateVaultEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "vaultConfigMaxCapBefore",
            "type": "u64"
          },
          {
            "name": "vaultConfigMaxCapAfter",
            "type": "u64"
          },
          {
            "name": "vaultConfigStartAtTsBefore",
            "type": "u64"
          },
          {
            "name": "vaultConfigStartAtTsAfter",
            "type": "u64"
          },
          {
            "name": "vaultConfigLockedProfitDegradationDurationBefore",
            "type": "u64"
          },
          {
            "name": "vaultConfigLockedProfitDegradationDurationAfter",
            "type": "u64"
          },
          {
            "name": "vaultConfigWithdrawalWaitingPeriodBefore",
            "type": "u64"
          },
          {
            "name": "vaultConfigWithdrawalWaitingPeriodAfter",
            "type": "u64"
          },
          {
            "name": "vaultConfigManagerPerformanceFeeBefore",
            "type": "u16"
          },
          {
            "name": "vaultConfigManagerPerformanceFeeAfter",
            "type": "u16"
          },
          {
            "name": "vaultConfigAdminPerformanceFeeBefore",
            "type": "u16"
          },
          {
            "name": "vaultConfigAdminPerformanceFeeAfter",
            "type": "u16"
          },
          {
            "name": "vaultConfigManagerManagementFeeBefore",
            "type": "u16"
          },
          {
            "name": "vaultConfigManagerManagementFeeAfter",
            "type": "u16"
          },
          {
            "name": "vaultConfigAdminManagementFeeBefore",
            "type": "u16"
          },
          {
            "name": "vaultConfigAdminManagementFeeAfter",
            "type": "u16"
          },
          {
            "name": "vaultConfigRedemptionFeeBefore",
            "type": "u16"
          },
          {
            "name": "vaultConfigRedemptionFeeAfter",
            "type": "u16"
          },
          {
            "name": "vaultConfigIssuanceFeeBefore",
            "type": "u16"
          },
          {
            "name": "vaultConfigIssuanceFeeAfter",
            "type": "u16"
          },
          {
            "name": "vaultLastUpdatedTs",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vault",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "docs": [
              "The vault's name."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "description",
            "docs": [
              "A description or summary for this vault."
            ],
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "asset",
            "docs": [
              "The vault’s main asset configuration (inline nested struct)."
            ],
            "type": {
              "defined": {
                "name": "vaultAsset"
              }
            }
          },
          {
            "name": "lp",
            "docs": [
              "The vault’s LP (share) configuration (inline nested struct)."
            ],
            "type": {
              "defined": {
                "name": "vaultLp"
              }
            }
          },
          {
            "name": "manager",
            "docs": [
              "The manager of this vault (has certain permissions)."
            ],
            "type": "pubkey"
          },
          {
            "name": "admin",
            "docs": [
              "The admin of this vault (broader or fallback permissions)."
            ],
            "type": "pubkey"
          },
          {
            "name": "vaultConfiguration",
            "docs": [
              "The vault fee, cap, and locked profit degradation duration configuration (inline nested struct)."
            ],
            "type": {
              "defined": {
                "name": "vaultConfiguration"
              }
            }
          },
          {
            "name": "feeConfiguration",
            "docs": [
              "The vault fee and cap configuration (inline nested struct)."
            ],
            "type": {
              "defined": {
                "name": "feeConfiguration"
              }
            }
          },
          {
            "name": "feeUpdate",
            "docs": [
              "The fee update state of the vault."
            ],
            "type": {
              "defined": {
                "name": "feeUpdate"
              }
            }
          },
          {
            "name": "feeState",
            "docs": [
              "The fee state of the vault."
            ],
            "type": {
              "defined": {
                "name": "feeState"
              }
            }
          },
          {
            "name": "highWaterMark",
            "type": {
              "defined": {
                "name": "highWaterMark"
              }
            }
          },
          {
            "name": "lastUpdatedTs",
            "docs": [
              "The last time (Unix timestamp) this vault data was updated."
            ],
            "type": "u64"
          },
          {
            "name": "version",
            "docs": [
              "The version of the vault."
            ],
            "type": "u8"
          },
          {
            "name": "padding0",
            "docs": [
              "padding to align future 8-byte fields on 8-byte boundaries."
            ],
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "lockedProfitState",
            "docs": [
              "The locked profit state of the vault."
            ],
            "type": {
              "defined": {
                "name": "lockedProfitState"
              }
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved bytes for future use."
            ],
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "vaultAsset",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "docs": [
              "The mint for the vault’s main asset."
            ],
            "type": "pubkey"
          },
          {
            "name": "idleAta",
            "docs": [
              "The “idle” token account holding un-invested assets."
            ],
            "type": "pubkey"
          },
          {
            "name": "totalValue",
            "docs": [
              "The total amount of this asset currently in the vault."
            ],
            "type": "u64"
          },
          {
            "name": "idleAtaAuthBump",
            "docs": [
              "The bump for the vault asset mint."
            ],
            "type": "u8"
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved bytes for future use."
            ],
            "type": {
              "array": [
                "u8",
                95
              ]
            }
          }
        ]
      }
    },
    {
      "name": "vaultConfiguration",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maxCap",
            "docs": [
              "The maximum total amount allowed in the vault."
            ],
            "type": "u64"
          },
          {
            "name": "startAtTs",
            "docs": [
              "active from timestamp"
            ],
            "type": "u64"
          },
          {
            "name": "lockedProfitDegradationDuration",
            "docs": [
              "The locked profit degradation duration."
            ],
            "type": "u64"
          },
          {
            "name": "withdrawalWaitingPeriod",
            "docs": [
              "The waiting period for a withdrawal. prec: seconds"
            ],
            "type": "u64"
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved bytes for future use."
            ],
            "type": {
              "array": [
                "u8",
                48
              ]
            }
          }
        ]
      }
    },
    {
      "name": "vaultInitializationInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maxCap",
            "docs": [
              "The maximum total amount allowed in the vault."
            ],
            "type": "u64"
          },
          {
            "name": "startAtTs",
            "docs": [
              "active from timestamp"
            ],
            "type": "u64"
          },
          {
            "name": "managerPerformanceFee",
            "docs": [
              "Manager performance fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "adminPerformanceFee",
            "docs": [
              "Admin performance fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "managerManagementFee",
            "docs": [
              "Manager management fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "adminManagementFee",
            "docs": [
              "Admin management fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "lockedProfitDegradationDuration",
            "docs": [
              "The locked profit degradation duration."
            ],
            "type": "u64"
          },
          {
            "name": "redemptionFee",
            "docs": [
              "The redemption fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "issuanceFee",
            "docs": [
              "The issuance fee in basis points (BPS)."
            ],
            "type": "u16"
          },
          {
            "name": "withdrawalWaitingPeriod",
            "docs": [
              "The waiting period for a withdrawal."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vaultLp",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "docs": [
              "The LP mint (e.g., representing shares in this vault)."
            ],
            "type": "pubkey"
          },
          {
            "name": "mintBump",
            "docs": [
              "The bump for the vault LP mint."
            ],
            "type": "u8"
          },
          {
            "name": "mintAuthBump",
            "docs": [
              "The bump for the vault LP mint authority."
            ],
            "type": "u8"
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved bytes for future use."
            ],
            "type": {
              "array": [
                "u8",
                62
              ]
            }
          }
        ]
      }
    },
    {
      "name": "withdrawStrategyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "strategy",
            "type": "pubkey"
          },
          {
            "name": "strategyInitReceipt",
            "type": "pubkey"
          },
          {
            "name": "adaptorProgram",
            "type": "pubkey"
          },
          {
            "name": "vaultAssetTotalValueBefore",
            "type": "u64"
          },
          {
            "name": "vaultAssetTotalValueAfter",
            "type": "u64"
          },
          {
            "name": "vaultLpSupplyInclFeesBefore",
            "type": "u64"
          },
          {
            "name": "vaultLpSupplyInclFeesAfter",
            "type": "u64"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsBefore",
            "type": "u128"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsAfter",
            "type": "u128"
          },
          {
            "name": "vaultAssetIdleAtaAmountBefore",
            "type": "u64"
          },
          {
            "name": "vaultAssetIdleAtaAmountAfter",
            "type": "u64"
          },
          {
            "name": "strategyPositionValueBefore",
            "type": "u64"
          },
          {
            "name": "strategyPositionValueAfter",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawVaultEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "vaultAssetTotalValueBefore",
            "type": "u64"
          },
          {
            "name": "vaultAssetTotalValueAfter",
            "type": "u64"
          },
          {
            "name": "vaultLpSupplyInclFeesBefore",
            "type": "u64"
          },
          {
            "name": "vaultLpSupplyInclFeesAfter",
            "type": "u64"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsBefore",
            "type": "u128"
          },
          {
            "name": "vaultHighestAssetPerLpDecimalBitsAfter",
            "type": "u128"
          },
          {
            "name": "vaultLastUpdatedTs",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
