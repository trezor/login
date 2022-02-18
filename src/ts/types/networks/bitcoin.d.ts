import type {
    AmountUnit,
    PrevInput,
    TxInput as OrigTxInputType,
    TxInputType,
    TxOutputType,
    TxOutputBinType,
    TxAckPaymentRequest,
    Address as ProtobufAddress,
    OwnershipId as ProtobufOwnershipId,
    OwnershipProof as ProtobufOwnershipProof,
    MultisigRedeemScriptType,
    InternalInputScriptType,
} from '../trezor/protobuf';
import type { AccountAddresses } from '../account';

// getAddress params
export interface GetAddress {
    path: string | number[];
    address?: string;
    showOnTrezor?: boolean;
    coin?: string;
    crossChain?: boolean;
    multisig?: MultisigRedeemScriptType;
    scriptType?: InternalInputScriptType;
}

// getAddress response
export type Address = ProtobufAddress & {
    path: number[];
    serializedPath: string;
};

// getPublicKey params
export interface GetPublicKey {
    path: string | number[];
    coin?: string;
    crossChain?: boolean;
    showOnTrezor?: boolean;
}

// combined Bitcoin.PublicKey and Bitcoin.HDNode
export interface HDNodeResponse {
    path: number[];
    serializedPath: string;
    childNum: number;
    xpub: string;
    xpubSegwit?: string;
    chainCode: string;
    publicKey: string;
    fingerprint: number;
    depth: number;
}

// based on PROTO.TransactionType, with required fields
export type RefTransaction =
    | {
          hash: string;
          version: number;
          inputs: PrevInput[];
          bin_outputs: TxOutputBinType[];
          outputs?: undefined;
          lock_time: number;
          extra_data?: string;
          expiry?: number;
          overwintered?: boolean;
          version_group_id?: number;
          timestamp?: number;
          branch_id?: number;
      }
    | {
          hash: string;
          version: number;
          inputs: OrigTxInputType[];
          bin_outputs?: undefined;
          outputs: TxOutputType[];
          lock_time: number;
          extra_data?: string;
          expiry?: number;
          overwintered?: boolean;
          version_group_id?: number;
          timestamp?: number;
          branch_id?: number;
      };

// based on PROTO.SignTx, only optional fields
export type TransactionOptions = {
    version?: number;
    lock_time?: number;
    expiry?: number;
    overwintered?: boolean;
    version_group_id?: number;
    timestamp?: number;
    branch_id?: number;
    decred_staking_ticket?: boolean;
};

// signTransaction params
export interface SignTransaction {
    inputs: TxInputType[];
    outputs: TxOutputType[];
    paymentRequests?: TxAckPaymentRequest[];
    refTxs?: RefTransaction[];
    account?: {
        addresses: AccountAddresses;
    };
    coin: string;
    locktime?: number;
    timestamp?: number;
    version?: number;
    expiry?: number;
    overwintered?: boolean;
    versionGroupId?: number;
    branchId?: number;
    decredStakingTicket?: boolean;
    push?: boolean;
    preauthorized?: boolean;
}

export type SignedTransaction = {
    signatures: string[];
    serializedTx: string;
    txid?: string;
};

export type GetOwnershipId = {
    path: string | number[];
    coin?: string;
    multisig?: MultisigRedeemScriptType;
    scriptType?: InternalInputScriptType;
    preauthorized?: boolean;
};

export type OwnershipId = ProtobufOwnershipId & {
    path: number[];
    serializedPath: string;
};

export type GetOwnershipProof = {
    path: string | number[];
    coin?: string;
    multisig?: MultisigRedeemScriptType;
    scriptType?: InternalInputScriptType;
    userConfirmation?: boolean;
    ownershipIds?: string[];
    commitmentData?: string;
    preauthorized?: boolean;
};

export type OwnershipProof = ProtobufOwnershipProof & {
    path: number[];
    serializedPath: string;
};

export type AuthorizeCoinJoin = {
    path: string | number[];
    coordinator: string;
    maxRounds: number;
    maxCoordinatorFeeRate: number;
    maxFeePerKvbyte: number;
    coin?: string;
    scriptType?: InternalInputScriptType;
    amountUnit?: AmountUnit;
};

// push transaction params
export interface PushTransaction {
    tx: string;
    coin: string;
}

// push transaction response
export interface PushedTransaction {
    txid: string;
}

export interface SignMessage {
    path: string | number[];
    coin: string;
    message: string;
    hex?: boolean;
    no_script_type?: boolean;
}

export interface VerifyMessage {
    address: string;
    signature: string;
    message: string;
    coin: string;
    hex?: boolean;
}

export { TxInputType, TxOutputType } from '../trezor/protobuf';
