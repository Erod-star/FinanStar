module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
};
