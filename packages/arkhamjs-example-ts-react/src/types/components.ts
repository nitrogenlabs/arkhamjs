export interface ComponentProps {
  readonly className?: string;
}

export interface IconProps extends ComponentProps {
  readonly name: string;
  readonly size?: string;
}
