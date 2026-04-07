import * as React from 'react';

type ButtonVariant = 'default' | 'outline';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = 'default',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyle =
    variant === 'outline'
      ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      : 'bg-orange-500 text-white hover:bg-orange-600';

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    />
  );
}