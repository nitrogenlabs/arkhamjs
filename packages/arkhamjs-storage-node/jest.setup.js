jest.mock('node-persist', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn()
}));
