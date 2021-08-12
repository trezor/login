/* @flow */

import { ERRORS } from '../../../constants';
import type { TypedCall, EthereumTxRequest } from '../../../types/trezor/protobuf';
import type { EthereumAccessList } from '../../../types'

const splitString = (str: ?string, len: number) => {
    if (str == null) {
        return ['', ''];
    }
    const first = str.slice(0, len);
    const second = str.slice(len);
    return [first, second];
};

const processTxRequest = async (
    typedCall: TypedCall,
    request: EthereumTxRequest,
    data: ?string,
    chain_id: ?number,
) => {
    if (!request.data_length) {
        let v = request.signature_v;
        const r = request.signature_r;
        const s = request.signature_s;
        if (v == null || r == null || s == null) {
            throw ERRORS.TypedError('Runtime', 'processTxRequest: Unexpected request');
        }

        // recompute "v" value
        // from: https://github.com/kvhnuke/etherwallet/commit/288bd35497e00ad3947e9d11f60154bae1bf3c2f
        if (chain_id && v <= 1) {
            v += 2 * chain_id + 35;
        }

        return Promise.resolve({
            v: `0x${v.toString(16)}`,
            r: `0x${r}`,
            s: `0x${s}`,
        });
    }

    const [first, rest] = splitString(data, request.data_length * 2);
    const response = await typedCall('EthereumTxAck', 'EthereumTxRequest', { data_chunk: first });

    return processTxRequest(typedCall, response.message, rest, chain_id);
};

const stripLeadingZeroes = (str: string) => {
    while (/^00/.test(str)) {
        str = str.slice(2);
    }
    return str;
};

export const ethereumSignTx = async (
    typedCall: TypedCall,
    address_n: number[],
    to: string,
    value: string,
    gas_limit: string,
    gas_price: string,
    nonce: string,
    data?: string,
    chain_id?: number,
    tx_type?: number,
) => {
    const length = data == null ? 0 : data.length / 2;

    const [first, rest] = splitString(data, 1024 * 2);

    let message = {
        address_n,
        nonce: stripLeadingZeroes(nonce),
        gas_price: stripLeadingZeroes(gas_price),
        gas_limit: stripLeadingZeroes(gas_limit),
        to,
        value: stripLeadingZeroes(value),
    };

    if (length !== 0) {
        message = {
            ...message,
            data_length: length,
            data_initial_chunk: first,
        };
    }

    if (chain_id) {
        message = {
            ...message,
            chain_id,
        };
    }

    if (tx_type !== null) {
        message = {
            ...message,
            tx_type,
        };
    }

    const response = await typedCall('EthereumSignTx', 'EthereumTxRequest', message);

    return processTxRequest(typedCall, response.message, rest, chain_id);
};


export const ethereumSignTxEIP1559 = async (
    typedCall: TypedCall,
    address_n: number[],
    to: string,
    value: string,
    gas_limit: string,
    max_gas_fee: string,
    max_priority_fee: string,
    nonce: string,
    chain_id: number,
    data?: string,
    access_list?: EthereumAccessList[]
) => {
    const length = data == null ? 0 : data.length / 2;

    const [first, rest] = splitString(data, 1024 * 2);

    const message = {
        address_n,
        nonce: stripLeadingZeroes(nonce),
        max_gas_fee: stripLeadingZeroes(max_gas_fee),
        max_priority_fee: stripLeadingZeroes(max_priority_fee),
        gas_limit: stripLeadingZeroes(gas_limit),
        to,
        value: stripLeadingZeroes(value),
        data_length: length,
        data_initial_chunk: first,
        chain_id,
        access_list: access_list?.map(a => ({ address: a.address, storage_keys: a.storageKeys })) ?? []
    };

    const response = await typedCall('EthereumSignTxEIP1559', 'EthereumTxRequest', message);

    return processTxRequest(typedCall, response.message, rest);
};
