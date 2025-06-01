import { useState } from "react";
import { ChevronUp, ChevronDown, Phone, AlertTriangle, MapPin, Clock } from "lucide-react";
import EventCard from "./EventCard";

export default function ActiveEvents({ alerts }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Semi-transparent backdrop when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/10 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Dashboard Container - Positioned at the bottom, slightly shorter, and styled */}
      <div
        className={`fixed bottom-0 left-1/2 w-[600px] bg-white shadow-lg rounded-t-lg border border-gray-200 transition-transform duration-300 ease-in-out z-50 transform -translate-x-1/2 ${
          isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-120px)]'
        }`}
      >
        {/* Header - Always visible */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {/* Left side: Chevron and Active Incidents title */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-gray-600 hover:bg-gray-100 rounded-md text-sm p-1 flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
              <span className="font-semibold text-gray-900">Active Incidents</span>
            </button>
          </div>

          {/* Right side content of header (Critical count and 911) - Conditional visibility */}
          <div className="flex items-center space-x-4 flex-shrink-0"> {/* Container for right side elements */}
            {/* Critical Count - Shown only when collapsed */}
            {!isExpanded && (
              <div className="flex items-center text-red-600 text-sm">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-1"></span>
                <span>0 Critical</span>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Content Area (Event Cards and Footer) - Conditionally rendered */}
        {isExpanded && (
          <div className="max-h-[55vh] overflow-hidden flex flex-col">
            {/* Content Area with padding and spacing for cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {alerts && alerts.map((incident) => (
                <div key={incident.id}>
                  <EventCard
                    incident={incident}
                    onClick={() => {
                      console.log("Event card clicked:", incident);
                    }}
                  />
                </div>
              ))}
              {(!alerts || alerts.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No active alerts
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 grid grid-cols-2 gap-3"></div>
          </div>
        )}
      </div>
    </>
  );
}
