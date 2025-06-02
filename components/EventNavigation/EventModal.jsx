import { useState, useEffect } from "react";
import { X, Phone, MessageCircle, Camera, MapPin, Clock, User, AlertTriangle, Send, Heart, Thermometer, Droplet, Wifi, Mic, Map } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import dynamic from 'next/dynamic';

// Dynamically import the MapTab component to ensure it only renders on the client side
const MapTab = dynamic(() => import('./ResponderLoc'), { ssr: false });

const severityColors = {
  critical: 'bg-red-100 text-red-800 border border-red-400 shadow-sm',
  high: 'bg-orange-100 text-orange-800 border border-orange-400 shadow-sm',
  medium: 'bg-yellow-100 text-yellow-800 border border-yellow-400 shadow-sm',
  low: 'bg-green-100 text-green-800 border border-green-400 shadow-sm',
};

const statusColors = {
  active: 'bg-red-200 text-red-800 border border-red-400 shadow-sm',
  in_progress: 'bg-blue-200 text-blue-800 border border-blue-400 shadow-sm',
  resolved: 'bg-green-200 text-green-800 border border-green-400 shadow-sm',
};

// Define header background colors based on category
const headerColors = {
  Medical: 'bg-red-600 text-white',
  Fire: 'bg-orange-500 text-white',
  Crime: 'bg-blue-600 text-white',
};

const mockVoiceChannels = [
  { label: 'On Ground - Connected', participants: 'Vol #122,159,12', count: 3, icon: Wifi },
  { label: 'Responders', participants: 'WCN-2021, Dispatch', count: 2, icon: Mic },
];

const mockTranscript = [
  { time: '21:37:12', sender: 'On Ground Vol #122 - Jacob', text: "He is still unresponsive, CPR isn't helping, we need a defibrillator fast" },
  { time: '21:35:12', sender: 'On Ground Dispatch', text: "Ambulance is en-route ETA - 7 minutes. Continue CPR till they reach" },
  { time: '21:32:12', sender: 'On Ground Vol #159 - Sarah', text: "Picked up defibrillator, give me 10 mins. I'll reach" },
];

const mockMedia = [
  { id: 1, type: "video", url: "/Starred_media.png", caption: "9:41 AM CPR Initiated by Volunteer #122", starred: true },
  { id: 2, type: "image", url: "/media 1.png", caption: "Volunteers" },
  { id: 3, type: "image", url: "/media 2.png", caption: "Ambulance" },
  { id: 4, type: "image", url: "/media 3.png", caption: "Medical kit" },
];

export default function EventModal({ incident, setModal }) {
  const [activeTab, setActiveTab] = useState('details');
  const [activeMediaFilter, setActiveMediaFilter] = useState('All');
  const [newMessage, setNewMessage] = useState('');

  if (!incident) return null;

  const timeAgo = incident.reportedAt ? formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true }) : 'Unknown';
  const severityColor = severityColors[incident.severity || 'medium'];
  const statusColor = statusColors[incident.status || 'active'];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      setNewMessage('');
    }
  };

  const handleClose = () => {
    setModal(false);
  };

  const filteredMedia = mockMedia.filter(media => {
    if (activeMediaFilter === 'All') return true;
    if (activeMediaFilter === 'Videos') return media.type === 'video';
    if (activeMediaFilter === 'Images') return media.type === 'image';
    return false;
  });

  const starredMedia = filteredMedia.find(media => media.starred);
  const otherMedia = filteredMedia.filter(media => !media.starred);

  const renderDetailsTab = () => (
    <div className="p-6 space-y-6 bg-white">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {incident.event_code} - {incident.event_type}
            </h2>
            <div className="text-gray-600 text-sm mb-2">ID: #{incident.id.toString().padStart(4, '0')}</div>
            <div className="text-gray-600 text-sm mb-4">{incident.address}</div>

            <div className="flex items-center space-x-4 text-sm mb-2">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Assigned: <span className="font-semibold">{incident.assigned?.responders?.join(', ') || 'N/A'}</span></span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">ETA: <span className="font-semibold">10:56</span></span>
              </div>
            </div>

            <div className={`flex items-center space-x-2 mb-4 rounded-md px-3 py-1 ${statusColor}`}>
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Status - {incident.status_message || (incident.status ? incident.status.replace('_', ' ').toUpperCase() : 'N/A')}</span>
            </div>

            <div className="space-y-1 mb-4">
              <div className="font-semibold text-gray-900">Volunteers</div>
              <ul className="list-disc list-inside text-gray-700 text-sm">
                {/* Display Basic volunteers on a single line if any exist */}
                {incident.assigned?.volunteers?.basic && incident.assigned.volunteers.basic.filter(vol => vol).length > 0 && (
                  <li>Basic - {incident.assigned.volunteers.basic.filter(vol => vol).join(', ')}</li>
                )}
                {/* Display Intermediate volunteers on a single line if any exist */}
                {incident.assigned?.volunteers?.Intermediate && incident.assigned.volunteers.Intermediate.filter(vol => vol).length > 0 && (
                  <li>Intermediate - {incident.assigned.volunteers.Intermediate.filter(vol => vol).join(', ')}</li>
                )}
                {/* Display Advanced volunteers on a single line if any exist */}
                {incident.assigned?.volunteers?.Advanced && incident.assigned.volunteers.Advanced.filter(vol => vol).length > 0 && (
                  <li>Advanced - {incident.assigned.volunteers.Advanced.filter(vol => vol).join(', ')}</li>
                )}
                {/* Display N/A if no volunteers in any category */}
                {(!incident.assigned?.volunteers?.basic?.filter(vol => vol).length && !incident.assigned?.volunteers?.Intermediate?.filter(vol => vol).length && !incident.assigned?.volunteers?.Advanced?.filter(vol => vol).length) && (
                  <li>N/A</li>
                )}
              </ul>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
            <MapPin className="w-4 h-4 mr-1" />
            View Map
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Updates</h3>
          <div className="space-y-3">
            {incident.updates && incident.updates.map((update, index) => (
              <div key={index} className="bg-gray-100 p-3 rounded-md flex justify-between items-start shadow-sm">
                <div>
                  {update.headline && <p className="font-semibold text-sm text-gray-900 mb-1">{update.headline}</p>}
                  <p className="text-sm text-gray-900 pr-4">{update.description}</p>
          </div>
                <span className="text-xs text-gray-700 flex-shrink-0">{update.time ? formatDistanceToNow(new Date(update.time), { addSuffix: true }) : 'Unknown'}</span>
          </div>
            ))}
            {(!incident.updates || incident.updates.length === 0) && (
              <div className="text-sm text-gray-600 italic">No updates available.</div>
          )}
        </div>
        </div>
      </div>
    </div>
  );

  const renderMediaTab = () => (
    <div className="p-6 bg-white">
      <h3 className="font-semibold text-gray-900 mb-4">Smart Tech Data</h3>
      {incident.smart_tech_data && (
        <div className="grid grid-cols-3 gap-4 text-center text-sm mb-6">
          <div className="rounded-lg p-2 shadow-sm bg-red-100 text-red-800 border border-red-400">
            <Heart className="w-5 h-5 mx-auto mb-1" />
            <div className="font-semibold">{incident.smart_tech_data.heart_rate}</div>
          </div>
          <div className="rounded-lg p-2 shadow-sm bg-blue-100 text-blue-800 border border-blue-400">
            <Droplet className="w-5 h-5 mx-auto mb-1" />
            <div className="font-semibold">{incident.smart_tech_data.SpO2}</div>
          </div>
          <div className="rounded-lg p-2 shadow-sm bg-orange-100 text-orange-800 border border-orange-400">
            <Thermometer className="w-5 h-5 mx-auto mb-1" />
            <div className="font-semibold">{incident.smart_tech_data.temperature}</div>
          </div>
        </div>
      )}

      <button className="w-full px-4 py-2 bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400 transition">
        Medical Records
      </button>

      <h3 className="font-semibold text-gray-900 mb-4 mt-6">Media</h3>

      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
        {['All', 'Videos', 'Images'].map(filter => (
          <button
            key={filter}
            className={`flex-1 py-1 rounded-md ${
              activeMediaFilter === filter 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveMediaFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {starredMedia && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-md mb-4 bg-black">
          <img
            src={starredMedia.url}
            alt={starredMedia.caption}
            className="w-full h-full object-cover"
          />
          {starredMedia.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-70 transition">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
            </div>
          )}
        </div>
      )}

      {otherMedia.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {otherMedia.map((media) => (
          <div key={media.id} className="space-y-2">
              <div className="relative w-full h-32 rounded-lg overflow-hidden shadow-md bg-gray-200">
            <img 
              src={media.url} 
              alt={media.caption}
                  className="w-full h-full object-cover"
            />
                {media.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-70 transition">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                  </div>
                )}
              </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );

  const renderChatTab = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Voice Channels</h3>
        <div className="space-y-3">
          {mockVoiceChannels.map((channel, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <channel.icon className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">{channel.label}</div>
                  <div className="text-sm text-gray-500">{channel.participants}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">{channel.count} online</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {mockTranscript.map((message, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{message.time}</span>
                <span className="text-sm font-medium text-gray-900">{message.sender}</span>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-800">
                {message.text}
              </div>
            </div>
          ))}
          </div>
      </div>

      <div className="p-4 bg-gray-100 border-t border-gray-300">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button 
            onClick={handleSendMessage}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderMapTab = () => {
    // We can now directly render MapTab as it's dynamically imported
    return <MapTab incident={incident} />;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className={`flex items-center justify-between p-4 border-b border-red-700 shadow ${headerColors[incident.category] || 'bg-gray-600 text-white'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center shadow-md">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">{incident.event_code} - {incident.event_type}</h2>
              <p className="text-sm text-red-200">Emergency Response Active - {timeAgo}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-red-700 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-300">
          {[
            { id: 'details', label: 'Details', icon: AlertTriangle },
            { id: 'media', label: 'Media', icon: Camera },
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'map', label: 'Map', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex-1 flex items-center justify-center py-3 px-4 transition ${
                  activeTab === tab.id 
                    ? 'bg-gray-100 text-red-700 border-b-2 border-red-600'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-grow overflow-y-auto">
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'media' && renderMediaTab()}
          {activeTab === 'chat' && renderChatTab()}
          {activeTab === 'map' && renderMapTab()}
        </div>

        <div className="p-4 border-t border-gray-300 bg-gray-100">
          <div className="flex space-x-2">
            <button className="flex-1 px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-900 transition">
              <MapPin className="w-4 h-4 mr-2" />
              View on Map
            </button>
            <button className="flex-1 px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-900 transition">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Team
            </button>
            <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center transition">
              <Phone className="w-4 h-4 mr-2" />
              Emergency Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
