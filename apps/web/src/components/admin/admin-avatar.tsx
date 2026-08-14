import { cn } from "@/lib/utils";

export interface AdminAvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-10 text-sm",
};

export function AdminAvatar({
  initials,
  size = "sm",
  className,
}: AdminAvatarProps) {
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
