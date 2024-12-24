/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/voltr_adaptor.json`.
 */
export type VoltrAdaptor = {
  "address": "3BufioDyECNwuFJLRGCXNbZFrsnJnCsALMfDKjQEnk8x",
  "metadata": {
    "name": "voltrAdaptor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createStrategy",
      "discriminator": [
        152,
        160,
        107,
        148,
        245,
        190,
        127,
        224
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "counterpartyAssetTa",
          "writable": true
        },
        {
          "name": "strategy",
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
                  121
                ]
              },
              {
                "kind": "account",
                "path": "counterpartyAssetTa"
              }
            ]
          }
        },
        {
          "name": "protocolProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "strategyType",
          "type": {
            "defined": {
              "name": "strategyType"
            }
          }
        }
      ]
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "vaultAssetIdleAuth",
          "writable": true,
          "signer": true
        },
        {
          "name": "strategy"
        },
        {
          "name": "vaultStrategy",
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
                  121
                ]
              },
              {
                "kind": "account",
                "path": "vaultAssetIdleAuth"
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
          "name": "counterpartyAssetTa",
          "writable": true
        },
        {
          "name": "protocolProgram"
        },
        {
          "name": "assetTokenProgram"
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
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultAssetIdleAuth",
          "writable": true,
          "signer": true
        },
        {
          "name": "strategy"
        },
        {
          "name": "vaultStrategy",
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
                  121
                ]
              },
              {
                "kind": "account",
                "path": "vaultAssetIdleAuth"
              },
              {
                "kind": "account",
                "path": "strategy"
              }
            ]
          }
        },
        {
          "name": "protocolProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "vaultAssetIdleAuth",
          "writable": true,
          "signer": true
        },
        {
          "name": "strategy"
        },
        {
          "name": "vaultStrategy",
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
                  121
                ]
              },
              {
                "kind": "account",
                "path": "vaultAssetIdleAuth"
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
          "name": "counterpartyAssetTa",
          "writable": true
        },
        {
          "name": "counterpartyAssetTaAuth",
          "writable": true
        },
        {
          "name": "protocolProgram"
        },
        {
          "name": "assetTokenProgram"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "strategy",
      "discriminator": [
        174,
        110,
        39,
        119,
        82,
        106,
        169,
        102
      ]
    },
    {
      "name": "vaultStrategy",
      "discriminator": [
        116,
        9,
        73,
        37,
        73,
        192,
        63,
        215
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
      "name": "invalidAccountOwner",
      "msg": "Invalid account owner."
    },
    {
      "code": 6002,
      "name": "alreadyInitialized",
      "msg": "Already initialized."
    },
    {
      "code": 6003,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint."
    },
    {
      "code": 6004,
      "name": "invalidAccountInput",
      "msg": "Invalid account input."
    },
    {
      "code": 6005,
      "name": "notRentExempt",
      "msg": "Not rent exempt."
    },
    {
      "code": 6006,
      "name": "mathOverflow",
      "msg": "Math overflow."
    },
    {
      "code": 6007,
      "name": "kaminoDepositFailed",
      "msg": "Kamino deposit failed."
    },
    {
      "code": 6008,
      "name": "kaminoInitializeFailed",
      "msg": "Kamino initialize failed."
    },
    {
      "code": 6009,
      "name": "marginfiInitializeFailed",
      "msg": "Marginfi initialize failed."
    },
    {
      "code": 6010,
      "name": "solendInitializeFailed",
      "msg": "Solend initialize failed."
    },
    {
      "code": 6011,
      "name": "invalidRemainingAccounts",
      "msg": "Invalid remaining accounts."
    }
  ],
  "types": [
    {
      "name": "strategy",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "counterpartyAssetTa",
            "type": "pubkey"
          },
          {
            "name": "protocolProgram",
            "type": "pubkey"
          },
          {
            "name": "strategyType",
            "type": {
              "defined": {
                "name": "strategyType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "strategyType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "solend"
          },
          {
            "name": "drift"
          },
          {
            "name": "marginfi"
          },
          {
            "name": "kamino"
          }
        ]
      }
    },
    {
      "name": "vaultStrategy",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vaultAssetIdleAuth",
            "type": "pubkey"
          },
          {
            "name": "strategy",
            "type": "pubkey"
          },
          {
            "name": "currentAmount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
