import {StringService} from './StringService';

describe('StringService', () => {
  describe('.uppercaseWords', () => {
    it('should uppercase words', () => {
      const str: string = 'test string';
      const expected: string = 'Test String';
      return expect(StringService.uppercaseWords(str)).toBe(expected);
    });
  });

  describe('.capitalize', () => {
    it('should capitalize word', () => {
      const str: string = 'test';
      const expected: string = 'Test';
      return expect(StringService.capitalize(str)).toBe(expected);
    });
  });
});
