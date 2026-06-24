module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|webp)$': '<rootDir>/__mocks__/fileMock.js',
    '^react-native-image-picker$': '<rootDir>/__mocks__/imagePickerMock.js',
    '^react-native-keychain$': '<rootDir>/__mocks__/keychainMock.js',
  },
};
