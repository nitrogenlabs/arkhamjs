
const isObject = (obj) => typeof obj === 'object' && !Array.isArray(obj);

const deepMergeInto = (oldObject, newObject) => {
  const newKeys = Object.keys(newObject);
  const mergedObject = oldObject;

  newKeys.forEach((key) => {
    const oldValue = mergedObject[key];
    const newValue = newObject[key];

    if(isObject(oldValue) && isObject(newValue)) {
      mergedObject[key] = deepMergeInto(oldValue, newValue);
    } else {
      mergedObject[key] = newValue;
    }
  });

  return mergedObject;
};

const mock = {
  clear: jest.fn(async (callback) => {
    mock.storage = {};

    if(callback) {
      callback(null);
    }

    return null;
  }),
  flushGetRequests: jest.fn(),
  getAllKeys: jest.fn(),
  getItem: jest.fn(
    async (key: string, callback) => {
      const getResult = await mock.multiGet([key], undefined);

      const result = getResult[0] ? getResult[0][1] : null;


      if(callback) {
        callback(null, result);
      }

      return result;
    },
  ),
  mergeItem: jest.fn(
    (key: string, value: string, callback) =>
      mock.multiMerge([[key, value]], callback),
  ),
  multiGet: jest.fn(async (keys: string[], callback) => {
    const values = keys.map((key) => [
      key,
      mock.storage[key] || null
    ]);

    if(callback) {
      callback(null, values);
    }

    return values;
  }),
  multiMerge: jest.fn(async (keyValuePairs: any[][], callback) => {
    keyValuePairs.forEach((keyValue) => {
      const key = keyValue[0];
      const value = JSON.parse(keyValue[1]);
      const oldValue = JSON.parse(mock.storage[key]);
      const processedValue = JSON.stringify(deepMergeInto(oldValue, value));

      mock.storage[key] = processedValue;
    });

    if(callback) {
      callback(null);
    }

    return null;
  }),
  multiRemove: jest.fn(async (keys: string[], callback) => {
    keys.forEach((key) => {
      if(mock.storage[key]) {
        delete mock.storage[key];
      }
    });

    if(callback) {
      callback(null);
    }

    return null;
  }),
  multiSet: jest.fn(async (keyValuePairs: any[][], callback) => {
    keyValuePairs.forEach((keyValue) => {
      const key = keyValue[0];
      const value = keyValue[1];

      mock.storage[key] = value;
    });

    if(callback) {
      callback(null);
    }

    return null;
  }),
  removeItem: jest.fn((key: string, callback) => mock.multiRemove([key], callback)),
  setItem: jest.fn(
    async (key: string, value: string, callback) => {
      const setResult = await mock.multiSet([[key, value]], undefined);

      if(callback) {
        callback(setResult);
      }

      return setResult;
    },
  ),
  storage: {}
};

export default mock;
