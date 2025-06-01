import React from 'react';
import { ArrowLeft, MapPin, AlertTriangle, Cross, Map } from "lucide-react";

function CustomInfoWindow({ event, onCloseClick }) {
  console.log("EventInfo received event:", event);

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg">

        <header className="bg-gradient-to-br from-red-600 via-red-500 to-rose-500 text-white p-4 shadow-lg rounded-lg">
          <h1 className="text-lg font-bold text-white drop-shadow-sm mb-2">
            {event.event_code} – {event.event_type}
          </h1>

          <div className="flex flex-wrap gap-4 mb-2">
            <div className="flex items-center text-sm text-rose-100">
              <AlertTriangle size={16} className="mr-1 text-yellow-300" />
              Assigned: {event.assigned?.responders?.join(", ") || "None"}
            </div>

            {event.address && (
              <div className="flex items-center text-sm text-rose-100">
                <MapPin size={16} className="mr-1 text-emerald-300" />
                {event.address}
              </div>
            )}
          </div>

          {event.status_message && (
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center text-sm text-rose-100">
                <Cross size={16} className="mr-1 text-yellow-300" />
                {event.status_message}
              </div>
              <button
                className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded hover:bg-white/30 text-xs text-white"
              >
                <Map size={14} />
                View Map
              </button>
            </div>
          )}
        </header>
      </div>
  );
}

export default CustomInfoWindow; 