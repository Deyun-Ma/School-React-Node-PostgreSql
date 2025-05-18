import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarPlaceholderProps {
  src?: string | null | undefined;
  name: string;
  className?: string;
}

const AvatarPlaceholder = ({ src, name, className }: AvatarPlaceholderProps) => {
  // Generate initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <Avatar className={className}>
      <AvatarImage src={typeof src === 'string' ? src : undefined} alt={name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};

export default AvatarPlaceholder;
