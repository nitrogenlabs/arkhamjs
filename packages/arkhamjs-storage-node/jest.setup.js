jest.mock('node-persist', () => ({
  init: (options) => jest.fn(),
  getItem: (key) => Promise.resolve(jest.fn()),
  removeItem: (key) => Promise.resolve(jest.fn()),
  setItem: (key, val) => Promise.resolve(jest.fn())
}));
