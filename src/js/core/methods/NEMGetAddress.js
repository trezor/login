/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath, fromHardened, getSerializedPath } from '../../utils/pathUtils';

import { UI, ERRORS } from '../../constants';
import { UiMessage } from '../../message/builder';

import type { NEMAddress } from '../../types/networks/nem';
import type { MessageType } from '../../types/trezor/protobuf';

type Params = {
    ...$ElementType<MessageType, 'NEMGetAddress'>,
    address?: string,
};

const MAINNET = 0x68; // 104
const TESTNET = 0x98; // 152
const MIJIN = 0x60; // 96

export default class NEMGetAddress extends AbstractMethod<'nemGetAddress'> {
    params: Params[] = [];

    hasBundle: boolean;

    progress: number = 0;

    confirmed: ?boolean;

    init() {
        this.requiredPermissions = ['read'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('NEM'), this.firmwareRange);

        // create a bundle with only one batch if bundle doesn't exists
        this.hasBundle = !!this.payload.bundle;
        const payload = !this.payload.bundle
            ? { ...this.payload, bundle: [this.payload] }
            : this.payload;

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' },
            { name: 'useEventListener', type: 'boolean' },
        ]);

        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'path', obligatory: true },
                { name: 'address', type: 'string' },
                { name: 'network', type: 'number' },
                { name: 'showOnTrezor', type: 'boolean' },
            ]);

            const path = validatePath(batch.path, 3);
            let showOnTrezor = true;
            if (Object.prototype.hasOwnProperty.call(batch, 'showOnTrezor')) {
                showOnTrezor = batch.showOnTrezor;
            }

            this.params.push({
                address_n: path,
                network: batch.network || MAINNET,
                show_display: showOnTrezor,
                address: batch.address,
            });
        });

        const useEventListener =
            payload.useEventListener &&
            this.params.length === 1 &&
            typeof this.params[0].address === 'string' &&
            this.params[0].show_display;
        this.confirmed = useEventListener;
        this.useUi = !useEventListener;

        // set info
        if (this.params.length === 1) {
            let network = 'Unknown';
            switch (this.params[0].network) {
                case MAINNET:
                    network = 'Mainnet';
                    break;
                case TESTNET:
                    network = 'Testnet';
                    break;
                case MIJIN:
                    network = 'Mijin';
                    break;
                // no default
            }
            this.info = `Export NEM address for account #${
                fromHardened(this.params[0].address_n[2]) + 1
            } on ${network} network`;
        } else {
            this.info = 'Export multiple NEM addresses';
        }
    }

    getButtonRequestData(code: string) {
        if (code === 'ButtonRequest_Address') {
            const data = {
                type: 'address',
                serializedPath: getSerializedPath(this.params[this.progress].address_n),
                address: this.params[this.progress].address || 'not-set',
            };
            return data;
        }
        return null;
    }

    async confirmation() {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(
            UiMessage(UI.REQUEST_CONFIRMATION, {
                view: 'export-address',
                label: this.info,
            }),
        );

        // wait for user action
        const uiResp = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async noBackupConfirmation() {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(
            UiMessage(UI.REQUEST_CONFIRMATION, {
                view: 'no-backup',
            }),
        );

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async _call({ address_n, network, show_display }: Params) {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('NEMGetAddress', 'NEMAddress', {
            address_n,
            network,
            show_display,
        });
        return response.message;
    }

    async run() {
        const responses: NEMAddress[] = [];

        for (let i = 0; i < this.params.length; i++) {
            const batch = this.params[i];
            // silently get address and compare with requested address
            // or display as default inside popup
            if (batch.show_display) {
                const silent = await this._call({
                    ...batch,
                    show_display: false,
                });
                if (typeof batch.address === 'string') {
                    if (batch.address !== silent.address) {
                        throw ERRORS.TypedError('Method_AddressNotMatch');
                    }
                } else {
                    batch.address = silent.address;
                }
            }

            const response = await this._call(batch);
            responses.push({
                path: batch.address_n,
                serializedPath: getSerializedPath(batch.address_n),
                address: response.address,
            });

            if (this.hasBundle) {
                // send progress
                this.postMessage(
                    UiMessage(UI.BUNDLE_PROGRESS, {
                        progress: i,
                        response,
                    }),
                );
            }

            this.progress++;
        }
        return this.hasBundle ? responses : responses[0];
    }
}
