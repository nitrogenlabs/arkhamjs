import {capitalize, uppercaseWords} from './StringService';

describe('StringService', () => {
  describe('capitalize', () => {
    it('should capitalize word', () => {
      const str: string = 'test';
      const expected: string = 'Test';
      return expect(capitalize(str)).toBe(expected);
    });
  });

  describe('uppercaseWords', () => {
    it('should uppercase words', () => {
      const str: string = 'test string';
      const expected: string = 'Test String';
      return expect(uppercaseWords(str)).toBe(expected);
    });
  });
});
