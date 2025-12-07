interface AvatarProps {
    src?: string;
    alt?: string;
    size?: "sm" | "md" | "lg";
    initials?: string;
}

const sizeClasses = {
    sm: "size-8",
    md: "size-12",
    lg: "size-24",
};

export function Avatar({ src, alt, size = "md", initials }: AvatarProps) {
    if (src) {
        return (
            <div
                className={`${sizeClasses[size]} shrink-0 rounded-full bg-cover bg-center bg-no-repeat`}
                style={{ backgroundImage: `url("${src}")` }}
                role="img"
                aria-label={alt}
            />
        );
    }

    return (
        <div
            className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full bg-primary text-white font-medium`}
        >
            {initials || "?"}
        </div>
    );
}
