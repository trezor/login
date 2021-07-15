/* @flow */

import type { SafetyCheckLevel } from './protobuf';

export type ResetDevice = {
    strength?: number,
    label?: string,
    u2f_counter?: number,
    pin_protection?: boolean,
    passphrase_protection?: boolean,
    skip_backup?: boolean,
    no_backup?: boolean,
    backup_type?: 0 | 1,
};

export type ApplySettings = {
    homescreen?: string,
    display_rotation?: 0 | 90 | 180 | 270,
    use_passphrase?: boolean,
    label?: string,
    auto_lock_delay_ms?: number,
    safety_checks?: SafetyCheckLevel,
};

export type ApplyFlags = {
    flags: number,
};

export type ChangePin = {
    remove?: boolean,
};

export type FirmwareUpdateBinary = {
    binary: ArrayBuffer,
};
export type FirmwareUpdate = {
    version: number[],
    btcOnly?: boolean,
    baseUrl?: string,
    intermediary?: boolean,
};

export type RecoveryDevice = {
    passphrase_protection?: boolean,
    pin_protection?: boolean,
    label?: string,
    type?: 0 | 1,
    dry_run?: boolean,
    word_count?: 12 | 18 | 24,
    u2f_counter?: number,
    enforce_wordlist?: boolean,
    language?: string,
};
