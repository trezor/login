const commonFixtures = require('../../../../submodules/trezor-common/tests/fixtures/ethereum/sign_typed_data.json');
const typedData = require('./typedData');

// Adds 0x to a string if it doesn't start with one
// fixtures sometimes start with 0x, sometimes not
function messageToHex(string) {
    return string.startsWith('0x') ? string : `0x${string}`;
}

describe('typedData', () => {
    describe('should create message_hash and domain_separator_hash from typedData', () => {
        commonFixtures.tests
            .filter(test => test.parameters.metamask_v4_compat)
            .forEach(test => {
                it(test.name, () => {
                    const transformed = typedData(
                        test.parameters.data,
                        test.parameters.metamask_v4_compat,
                    );
                    const { domain_separator_hash, message_hash } = transformed;

                    expect(messageToHex(domain_separator_hash)).toEqual(
                        messageToHex(test.parameters.domain_separator_hash),
                    );
                    if (message_hash) {
                        expect(messageToHex(message_hash)).toEqual(
                            messageToHex(test.parameters.message_hash),
                        );
                    } else {
                        expect(null).toEqual(test.parameters.message_hash);
                    }
                });
            });
    });
});
