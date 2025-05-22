import React from "react";

function EventInfo(event) {
  return (
    <header className="bg-emergency-red text-white p-4 shadow-md">
      <div className="flex items-center">
        {onBack && (
          <button onClick={onBack} className="mr-2">
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-lg font-bold">
          {event.eventCode} - {event.eventType}
        </h1>
      </div>

      <div className="mt-2 text-sm flex flex-wrap gap-1">
        <div className="flex items-center mr-4">
          <MapPin size={16} className="mr-1" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center">
          <AlertTriangle size={16} className="mr-1" />
          <span>Assigned: {event.assignedCode}</span>
        </div>
      </div>

      {event.equipmentNeeded && (
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <Cross size={16} className="mr-1" />
            <span className="text-sm">{event.status_message}</span>
          </div>

          {showMap && onViewMap && (
            <button
              onClick={onViewMap}
              className="flex items-center p-1 bg-white bg-opacity-20 rounded"
            >
              <Map size={14} className="mr-1" />
              <span className="text-xs">View Map</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default EventInfo;
