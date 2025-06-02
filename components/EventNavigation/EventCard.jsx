import { AlertTriangle, Clock, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const typeColors = {
  medical: "bg-teal-100 text-teal-600", // Changed from red to teal
  fire: "bg-orange-100 text-orange-600",
  crime: "bg-blue-100 text-blue-600",
};

const serviceTypeIcons = {
  hospital: '🏥',
  fire_station: '🚒',
  police: '👮',
  ambulance: '🚑',
};

const typeIcons = {
  medical: <AlertTriangle className="w-6 h-6" />,
  fire: <AlertTriangle className="w-6 h-6" />,
  crime: <MapPin className="w-6 h-6" />,
};

const statusTextColor = "text-gray-700 font-medium";

const typeBackgrounds = {
  medical: "bg-white border-l-4 border-teal-600", // Changed from red to teal
  fire: "bg-white border-l-4 border-orange-600",
  crime: "bg-white border-l-4 border-blue-600",
};

export default function EventCard({ incident, onClick }) {
  const cardType = incident.type || "medical";
  const icon = typeIcons[cardType] || <AlertTriangle className="w-6 h-6" />;
  const cardBgClass = typeBackgrounds[cardType] || typeBackgrounds.medical;

  const reportedTime = incident.reportedAt
    ? formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: false })
    : "Unknown";



  return (
    <div
      className={`rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer p-4 mb-4 ${cardBgClass}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start">
          <div className={`mr-3 rounded-full p-2 ${typeColors[cardType] || typeColors.medical}`}>
            {icon}
          </div>
          <div className="font-bold text-lg leading-tight text-gray-800">
            {incident.event_code} - {incident.event_type || "N/A"}
          </div>
        </div>
        <div className="text-right text-xs leading-tight text-gray-600">
          <div>Reported: {incident.reportedAt ? formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: false }) : "Unknown"}</div>
          <div>Volunteers: {(incident.assigned?.volunteers?.basic?.length > 0 || incident.assigned?.volunteers?.Intermediate?.length > 0 || incident.assigned?.volunteers?.Advanced?.length > 0) ? 'Yes' : 'N/A'}</div>
          <div>ID: #{incident.event_code || incident.id || "N/A"}</div>
        </div>
      </div>
      <div className="text-sm leading-tight">
        <p className="mb-1 text-gray-700">
          {incident.address || "Location N/A"}
        </p>
        {incident.status_message && (
          <p className={`${statusTextColor}`}>
            Status - {incident.status_message}
          </p>
        )}
        {!incident.status_message && incident.status && (
          <p className={`${statusTextColor}`}>
            Status - {incident.status.replace("_", " ").toUpperCase()}
          </p>
        )}
      </div>
    </div>
  );
}
