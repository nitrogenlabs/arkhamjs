export type IconSize = 'sm' | 'md' | 'lg' | 'xl' | 'xx';

export interface IconProps {
  readonly className?: string;
  readonly name: string;
  readonly size?: IconSize;
}
