export interface AppConfig {
  readonly appId?: string;
  readonly appName?: string;
  readonly env?: string;
}

export interface EnvConfig {
  readonly default: AppConfig;
  readonly development: AppConfig;
  readonly preprod: AppConfig;
  readonly production: AppConfig;
  readonly test: AppConfig;
}
