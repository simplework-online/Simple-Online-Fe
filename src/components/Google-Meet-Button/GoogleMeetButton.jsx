import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

export default function GoogleMeetButton() {
  const handleClick = () => {
    window.open("https://meet.google.com/new", "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`
        bg-white text-[#00a94f] border border-gray-300 
        font-medium px-5 py-2 rounded-full
        transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-md hover:border-[#00a94f]
        hover:bg-[#f0f9f4] hover:text-[#008f42]
      `}
    >
      <Video className="mr-2 h-5 w-5 text-[#00a94f] group-hover:text-[#008f42]" />
      Join meeting
    </Button>
  );
}
