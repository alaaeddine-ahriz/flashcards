import { Avatar } from "./Avatar";

interface ProfileHeaderProps {
    name: string;
    avatarUrl?: string;
    masteryLevel: number;
}

export function ProfileHeader({
    name,
    avatarUrl,
    masteryLevel,
}: ProfileHeaderProps) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex w-full flex-row items-center gap-4 px-4 pt-4">
            <Avatar src={avatarUrl} alt={name} size="lg" initials={initials} />
            <div className="flex flex-col justify-center">
                <p className="text-[22px] font-bold leading-tight tracking-tight text-foreground">
                    {name}
                </p>
                <p className="text-base text-muted-foreground">
                    Mastery Level: {masteryLevel}%
                </p>
            </div>
        </div>
    );
}
