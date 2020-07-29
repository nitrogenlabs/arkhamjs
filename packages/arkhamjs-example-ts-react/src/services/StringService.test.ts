import {capitalize, uppercaseWords} from './StringService';

describe('StringService', () => {
  describe('.uppercaseWords', () => {
    it('should uppercase words', () => {
      const str = 'test string';
      const expected = 'Test String';
      return expect(uppercaseWords(str)).toBe(expected);
    });
  });

  describe('.capitalize', () => {
    it('should capitalize word', () => {
      const str = 'test';
      const expected = 'Test';
      return expect(capitalize(str)).toBe(expected);
    });
  });
});
