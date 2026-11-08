import { cn } from "@/lib/utils";

export interface InitialsAvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-10 text-sm",
};

export function InitialsAvatar({
  initials,
  size = "sm",
  className,
}: InitialsAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/10 font-bold text-primary shrink-0 aspect-square",
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
