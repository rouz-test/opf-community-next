import * as React from 'react';

type BadgeVariant = 'default' | 'outline';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = 'default',
  className = '',
  ...props
}: BadgeProps) {
  const baseStyle =
    'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium';

  const variantStyle =
    variant === 'outline'
      ? 'border-gray-200 bg-white text-gray-700'
      : 'border-transparent bg-orange-500 text-white';

  return (
    <span
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    />
  );
}