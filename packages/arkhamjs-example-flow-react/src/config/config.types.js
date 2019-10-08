export type AppConfig = {
  appId: string,
  appName: string,
  env: string
};

export type EnvConfig = {
  default: AppConfig,
  development: AppConfig,
  preprod: AppConfig,
  production: AppConfig,
  test: AppConfig
};
