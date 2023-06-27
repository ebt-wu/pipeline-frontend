Object.defineProperty(window, 'CSS', { value: null })
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
})
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
    }
  },
})
/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    }
  },
})

// The window.crypto.getRandomValues method is used by luigi-client internally.
// In order to get the tests using the "jest" test framework to run, we need
// to provide this function during test.
Object.defineProperty(window, 'crypto', {
  value: { getRandomValues: () => 1 },
})

/* eslint-disable */
// browserMocks.js
const localStorageMock = (() => {
  let store = {}

  return {
    getItem(key) {
      return store[key] || null
    },
    setItem(key, value) {
      store[key] = value.toString()
    },
    clear() {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

Object.defineProperty(window.document, 'cookie', {
  writable: true,
  value: 'luigiCookie=true',
})
