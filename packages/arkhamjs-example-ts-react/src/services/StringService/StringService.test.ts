import {StringService} from './StringService';

describe('StringService', () => {
  describe('.uppercaseWords', () => {
    it('should uppercase words', () => {
      const str = 'test string';
      const expected = 'Test String';
      return expect(StringService.uppercaseWords(str)).toBe(expected);
    });
  });

  describe('.capitalize', () => {
    it('should capitalize word', () => {
      const str = 'test';
      const expected = 'Test';
      return expect(StringService.capitalize(str)).toBe(expected);
    });
  });
});
