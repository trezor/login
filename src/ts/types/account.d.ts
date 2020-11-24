import { TransactionInput, TransactionOutput } from './trezor/protobuf';
import { VinVout } from './backend/transactions';

// getAccountInfo params
export interface GetAccountInfo {
    coin: string;
    path?: string;
    descriptor?: string;
    details?: 'basic' | 'tokens' | 'tokenBalances' | 'txids' | 'txs';
    tokens?: 'nonzero' | 'used' | 'derived';
    page?: number;
    pageSize?: number;
    from?: number;
    to?: number;
    contractFilter?: string;
    gap?: number;
    marker?: {
        ledger: number;
        seq: number;
    };
    defaultAccountType?: 'normal' | 'segwit' | 'legacy';
}

export interface TokenInfo {
    type: string; // token type: ERC20...
    address: string; // token address
    balance?: string; // token balance
    name?: string; // token name
    symbol?: string; // token symbol
    decimals: number; // token decimals or 0
    // transfers: number, // total transactions?
}

export interface AccountAddress {
    address: string;
    path: string;
    transfers: number;
    balance?: string;
    sent?: string;
    received?: string;
}

export interface AccountAddresses {
    change: AccountAddress[];
    used: AccountAddress[];
    unused: AccountAddress[];
}

export interface AccountUtxo {
    txid: string;
    vout: number;
    amount: string;
    blockHeight: number;
    address: string;
    path: string;
    confirmations: number;
    coinbase?: boolean;
}

// Transaction object
export interface TokenTransfer {
    type: 'sent' | 'recv' | 'self' | 'unknown';
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    amount: string;
    from?: string;
    to?: string;
}

// Transaction object
export interface TransactionTarget {
    addresses?: string[];
    isAddress: boolean;
    amount?: string;
    coinbase?: string;
    isAccountTarget?: boolean;
    n: number;
}

export interface AccountTransaction {
    type: 'sent' | 'recv' | 'self' | 'unknown';

    txid: string;
    blockTime?: number;
    blockHeight?: number;
    blockHash?: string;

    amount: string;
    fee: string;
    // total?: string; // amount + total

    targets: TransactionTarget[];
    tokens: TokenTransfer[];
    rbf?: boolean;
    ethereumSpecific?: {
        status: number;
        nonce: number;
        gasLimit: number;
        gasUsed?: number;
        gasPrice: string;
    };
    details: {
        vin: VinVout[];
        vout: VinVout[];
        size: number;
        totalInput: string;
        totalOutput: string;
    };
}

// getAccountInfo response
export interface AccountInfo {
    empty: boolean;
    path: string;
    descriptor: string; // address or xpub
    legacyXpub?: string; // bitcoin-like descriptor in legacy format (xpub) used by labeling (metadata)
    balance: string;
    availableBalance: string;
    tokens?: TokenInfo[]; // ethereum tokens
    addresses?: AccountAddresses; // bitcoin addresses
    utxo?: AccountUtxo[]; // bitcoin utxo
    history: {
        total: number; // total transactions (unknown in ripple)
        tokens?: number; // tokens transactions (unknown in ripple)
        unconfirmed?: number; // unconfirmed transactions (unknown in ripple)
        transactions?: AccountTransaction[]; // list of transactions
        txids?: string[]; // not implemented
    };
    misc?: {
        // ETH
        nonce?: string;
        erc20Contract?: TokenInfo;
        // XRP
        sequence?: number;
        reserve?: string;
    };
    page?: {
        // blockbook
        index: number;
        size: number;
        total: number;
    };
    marker?: {
        // ripple-lib
        ledger: number;
        seq: number;
    };
}

// Compose transaction

export interface RegularOutput {
    type?: 'external';
    address: string;
    amount: string;
    script_type?: 'PAYTOADDRESS';
}

export interface InternalOutput {
    type?: 'internal';
    address_n: number[];
    amount: string;
    script_type?: string;
}

export interface SendMaxOutput {
    type: 'send-max';
    address: string;
}

export interface OpReturnOutput {
    type: 'opreturn';
    dataHex: string;
}
export interface NoAddressOutput {
    type: 'noaddress';
    amount: string;
}

export interface NoAddressSendMaxOutput {
    type: 'send-max-noaddress';
}

export type ComposeOutput =
    | RegularOutput
    | InternalOutput
    | SendMaxOutput
    | OpReturnOutput
    | NoAddressOutput
    | NoAddressSendMaxOutput;

export interface PrecomposeParams {
    outputs: ComposeOutput[];
    account: {
        path: string;
        addresses: AccountAddresses;
        utxo: AccountUtxo[];
    };
    feeLevels: Array<{
        feePerUnit: string;
    }>;
    baseFee?: number;
    floorBaseFee?: boolean;
    coin: string;
}

export type PrecomposedTransaction =
    | {
          type: 'error';
          error: string;
      }
    | {
          type: 'nonfinal';
          max?: string;
          totalSpent: string; // all the outputs, no fee, no change
          fee: string;
          feePerByte: string;
          bytes: number;
      }
    | {
          type: 'final';
          max?: string;
          totalSpent: string; // all the outputs, no fee, no change
          fee: string;
          feePerByte: string;
          bytes: number;
          transaction: {
              inputs: TransactionInput[];
              outputs: TransactionOutput[];
          };
      };

export interface ComposeParams {
    outputs: ComposeOutput[];
    coin: string;
    push?: boolean;
}

export type DiscoveryAccountType = 'normal' | 'segwit' | 'legacy';

export interface DiscoveryAccount {
    type: DiscoveryAccountType;
    label: string;
    descriptor: string;
    address_n: number[];
    empty?: boolean;
    balance?: string;
    addresses?: AccountAddresses;
}

export interface FeeLevel {
    label: 'high' | 'normal' | 'economy' | 'low' | 'custom';
    feePerUnit: string;
    blocks: number;
    feeLimit?: string; // eth gas limit
    feePerTx?: string; // fee for BlockchainEstimateFeeParams.request.specific
}

export type SelectFeeLevel =
    | {
          name: string;
          fee: '0';
          disabled: true;
      }
    | {
          name: string;
          fee: string;
          feePerByte: string;
          minutes: number;
          total: string;
      };
