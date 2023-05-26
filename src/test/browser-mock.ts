/* eslint-disable */
// browserMocks.js
const localStorageMock = (() => {
  let store = {};

  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// The window.crypto.getRandomValues method is used by luigi-client internally.
// In order to get the tests using the "jest" test framework to run, we need
// to provide this function during test.
Object.defineProperty(window, 'crypto', {
  value: { getRandomValues: () => 1 },
});
