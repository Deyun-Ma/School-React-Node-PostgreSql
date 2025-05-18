import { cn } from "@/lib/utils";
import { Event } from "@shared/schema";
import { format } from "date-fns";

type EventCardProps = {
  event: Event;
  className?: string;
};

const EventCard = ({ event, className }: EventCardProps) => {
  // Define background colors based on event type
  const getEventColors = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-blue-100 text-blue-800";
      case "meeting":
        return "bg-emerald-100 text-emerald-800";
      case "holiday":
        return "bg-purple-100 text-purple-800";
      case "activity":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format the date to display month abbreviation and day
  const startDate = new Date(event.startDate);
  const monthAbbr = format(startDate, "MMM").toUpperCase();
  const day = format(startDate, "dd");

  return (
    <div className={cn("flex items-start space-x-4", className)}>
      <div
        className={cn(
          "flex-shrink-0 px-2 py-1 rounded-md text-center min-w-[48px]",
          getEventColors(event.type)
        )}
      >
        <span className="block text-sm font-semibold">{monthAbbr}</span>
        <span className="block text-xl font-bold">{day}</span>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-800">{event.title}</h4>
        <p className="text-xs text-gray-500 mt-1">
          {event.startTime && event.endTime
            ? `${event.startTime} - ${event.endTime}`
            : event.allDay
            ? "All day"
            : "Time not specified"}
        </p>
        {event.location && (
          <p className="text-xs text-gray-500 mt-0.5">{event.location}</p>
        )}
      </div>
    </div>
  );
};

export default EventCard;
