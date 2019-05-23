/* @flow */
'use strict';

import type { BitcoinNetworkInfo } from '../types';

const currencyUnits = 'mbtc2';

// TODO: chagne currency units

export const formatAmount = (n: number, coinInfo: BitcoinNetworkInfo): string => {
    const amount = (n / 1e8);
    if (coinInfo.isBitcoin && currencyUnits === 'mbtc' && amount <= 0.1 && n !== 0) {
        const s = (n / 1e5).toString();
        return `${s} mBTC`;
    }

    if(coinInfo.name === 'Flashcoin'){
        const s = (n / 1e10).toString();
        return `${s} ${coinInfo.shortcut}`;
    }
    const s = amount.toString();
    return `${s} ${coinInfo.shortcut}`;
};

export const formatTime = (n: number): string => {
    const hours = Math.floor(n / 60);
    const minutes = n % 60;

    if (!n) return 'No time estimate';
    let res = '';
    if (hours !== 0) {
        res += hours + ' hour';
        if (hours > 1) {
            res += 's';
        }
        res += ' ';
    }
    if (minutes !== 0) {
        res += minutes + ' minutes';
    }
    return res;
};

export const btckb2satoshib = (n: number): number => {
    return Math.round(n * 1e5);
};
