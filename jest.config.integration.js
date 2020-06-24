/*
 * Integration tests
 */

module.exports = {
    rootDir: './',
    moduleFileExtensions: ['js'],
    testMatch: ['**/tests/device/**/*.test.js'],
    modulePathIgnorePatterns: [
        'node_modules',
        '_old',
        'src/types',
        'src/ui',
        'src/utils/ws.ts'
    ],
    setupFilesAfterEnv: [
        '<rootDir>/tests/jest.setup.js',
        '<rootDir>/tests/common.setup.js'
    ],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    // collectCoverage: true,
    // coverageDirectory: './coverage/',
    // coveragePathIgnorePatterns: [
    //     "/node_modules/",
    //     "/__tests__/",
    //     "/__fixtures__/",
    //     "/tiny-worker/"
    // ],
    // collectCoverageFrom: [
    //     "./src/js/**/*.{js}",
    //     "!**/node_modules/**",
    // ]
};
