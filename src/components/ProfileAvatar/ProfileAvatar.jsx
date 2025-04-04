import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

export const ProfileAvatar = ({
  src,
  fallback = "",
  online = false,
  size = "md",
  className = "",
  showStatus = true,
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-14 w-14",
  };

  const statusSizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
    xl: "h-4 w-4",
  };

  const alt = "Profile Avatar";

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>
          {fallback || alt.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showStatus ? (
        <span
          className={cn(
            "absolute top-0 right-0 block rounded-full ring-2 ring-background",
            online ? "bg-green-500" : "bg-red-500",
            statusSizeClasses[size]
          )}
        />
      ) : null}
    </div>
  );
};

ProfileAvatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  fallback: PropTypes.string,
  online: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};
