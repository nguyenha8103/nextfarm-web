import { cn } from '@/lib/utils/cn';

export function Button({
  className,
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-[#236b4a] px-4 text-sm font-semibold text-white transition hover:bg-[#1d5b3f] disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      type={type}
      {...props}
    />
  );
}
