import { cn } from "@/lib/utils";

export function GlitchText({
  children,
  className,
  as: Tag = "span",
}: {
  children: string;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Tag className={cn("glitch relative inline-block", className)} data-text={children}>
      {children}
    </Tag>
  );
}
