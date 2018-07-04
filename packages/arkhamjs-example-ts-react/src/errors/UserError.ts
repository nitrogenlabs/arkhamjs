export class UserError extends Error {
  errors: string[];

  constructor(msg: string, errors: string[] = []) {
    super(msg);
    this.errors = errors || [];
  }
}
