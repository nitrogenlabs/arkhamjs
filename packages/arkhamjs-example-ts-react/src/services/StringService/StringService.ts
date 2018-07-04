export class StringService {
  static uppercaseWords(str: string = ''): string {
    return (str || '').replace(/\w\S*/g, (txt: string) => StringService.capitalize(txt));
  }

  static capitalize(str: string = ''): string {
    return `${str.charAt(0).toUpperCase()}${str.substr(1).toLowerCase()}`;
  }
}
