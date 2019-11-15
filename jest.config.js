const {defaults} = require('jest-config');
module.exports = {
	testMatch: [
		"**/__tests__/**/*.+(ts|tsx|js)",
		"**/?(*.)+(spec|test).+(ts|tsx|js)"
		],
	transform: {
		"^.+\\.(ts|tsx)?$": "ts-jest"
	},
	moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
};