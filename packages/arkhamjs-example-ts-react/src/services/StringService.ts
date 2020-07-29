
export const capitalize = (str: string = ''): string => {
  if(str.length > 1) {
    return `${str.charAt(0).toUpperCase()}${str.substr(1).toLowerCase()}`;
  }

  return str.toUpperCase();
};
export const uppercaseWords = (str: string = ''): string => (str || '').replace(/\w\S*/g, (txt: string) => capitalize(txt));
