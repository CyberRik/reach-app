import { useState } from "react";
import { X, Phone, MessageCircle, Camera, MapPin, Clock, User, AlertTriangle, Send, Heart, Thermometer, Droplet, Wifi, Mic } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const severityColors = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-600 text-white',
  medium: 'bg-yellow-600 text-white',
  low: 'bg-green-600 text-white',
};

const statusColors = {
  active: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

// Mock data based on image for demonstration
const mockUpdates = [
  { time: '9:41 AM', text: 'Volunteer #1234 is assisting with CPR. Defibrillator still needed.' },
  { time: '9:41 AM', text: 'Ambulance WGN-2021 & 5 minutes away. Team ready for defibrillator use.' },
  { time: '9:41 AM', text: 'Volunteer #22 picked up a defibrillator from the nearest facility, ETA 3 minutes.' },
  { time: '9:41 AM', text: "Patient's pulse is weak. First responders recommend additional oxygen support." },
  { time: '9:41 AM', text: 'Oxygen mask and kit required urgently. Volunteer #12 coordinating with nearby clinic.' },
];

const mockVoiceChannels = [
  { label: 'On Ground - Connected', participants: 'Vol #122,159,12', count: 3, icon: Wifi },
  { label: 'Responders', participants: 'WCN-2021, Dispatch', count: 2, icon: Mic },
];

const mockTranscript = [
  { time: '21:37:12', sender: 'On Ground Vol #122 - Jacob', text: "He is still unresponsive, CPR isn't helping, we need a defibrillator fast" },
  { time: '21:35:12', sender: 'On Ground Dispatch', text: "Ambulance is en-route ETA - 7 minutes. Continue CPR till they reach" },
  { time: '21:32:12', sender: 'On Ground Vol #159 - Sarah', text: "Picked up defibrillator, give me 10 mins. I'll reach" },
];

export default function EventModal({ incident, setModal }) {
  const [activeTab, setActiveTab] = useState('details');
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

  const renderDetailsTab = () => (
    <div className="p-6 space-y-6">
      {/* Incident Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
              CVX - Cardiac Event
            </h2>
            <div className="text-gray-600 dark:text-muted-foreground text-sm mb-2">ID: #{incident.id.toString().padStart(4, '0')}</div>
            <div className="text-gray-600 dark:text-muted-foreground text-sm mb-4">Ramanujam Block, Hostel Avenue<br/>IIT Madras</div> {/* Hardcoded location */}

            <div className="flex items-center space-x-4 text-sm mb-2">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4 text-gray-400" />
                <span>Assigned: <span className="font-semibold">WGN-2021</span></span>
              </div>
              <div className="flex items-center space-x-1">
                 <Clock className="w-4 h-4 text-gray-400" />
                <span>ETA: <span className="font-semibold">10:56</span></span> {/* Hardcoded ETA */}
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4">
               <AlertTriangle className="w-5 h-5 text-red-600" />
               <span className="font-semibold text-red-700">Status - Defibrillator Needed</span> {/* Hardcoded status */}
            </div>

            <div className="space-y-1 mb-4">
                <div className="font-semibold text-gray-900 dark:text-foreground">Volunteers</div>
                <ul className="list-disc list-inside text-gray-700 dark:text-foreground text-sm">
                    <li>Basic - #1234, #22</li> {/* Hardcoded volunteers */}
                    <li>Intermediate - #12</li>
                </ul>
            </div>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center text-sm">
             <MapPin className="w-4 h-4 mr-1" />
             View Map
           </button> {/* Hardcoded View Map button */}
        </div>

        {/* Updates */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-foreground">Updates</h3>
           <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm">Respond Now</button> {/* Hardcoded Respond Now button */}
          <div className="space-y-3">
            {mockUpdates.map((update, index) => (
              <div key={index} className="bg-gray-100 dark:bg-muted p-3 rounded-md flex justify-between items-start">
                <p className="text-sm text-gray-700 dark:text-muted-foreground pr-4">{update.text}</p>
                <span className="text-xs text-gray-500 dark:text-muted-foreground flex-shrink-0">{update.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMediaTab = () => (
    <div className="p-6">
      <h3 className="font-semibold text-gray-900 dark:text-foreground mb-4">Smart Tech Data</h3> {/* Changed header */}
       <div className="grid grid-cols-3 gap-4 text-center text-sm mb-6">
         <div>
           <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
           <div className="font-semibold text-gray-900 dark:text-foreground">35 BPM</div>
           <div className="text-gray-600 dark:text-muted-foreground">(Low)</div>
         </div>
         <div>
           <Droplet className="w-5 h-5 text-blue-500 mx-auto mb-1" /> {/* Using Droplet for SpO2 */}
           <div className="font-semibold text-gray-900 dark:text-foreground">92%</div>
           <div className="text-gray-600 dark:text-muted-foreground">(Low)</div>
         </div>
         <div>
           <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1" />
           <div className="font-semibold text-gray-900 dark:text-foreground">37.8°C</div>
           <div className="text-gray-600 dark:text-muted-foreground">(Fever)</div>
         </div>
       </div>

       <button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center text-sm mb-6">
         Medical Records {/* Hardcoded button */}
       </button>

      <h3 className="font-semibold text-gray-900 dark:text-foreground mb-4">Media</h3> {/* Changed header */}
      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
        <button className={`flex-1 py-1 rounded-md ${activeTab === 'media' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 dark:text-muted-foreground'}`}>All</button>
         <button className={`flex-1 py-1 rounded-md ${activeTab === 'media' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 dark:text-muted-foreground'}`}>Videos</button>
         <button className={`flex-1 py-1 rounded-md ${activeTab === 'media' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 dark:text-muted-foreground'}`}>Images</button>
      </div> {/* Hardcoded media tabs */}

      <div className="relative w-full h-48 rounded-lg overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400"
          alt="CPR in progress"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg> {/* Play button icon */}
        </div>
      </div> {/* Hardcoded media item */}
      <p className="text-sm text-gray-600 dark:text-muted-foreground mt-2 text-center">9:41 AM CPR Initiated by Volunteer #122</p> {/* Hardcoded caption */}

    </div>
  );

  const renderChatTab = () => (
    <div className="flex flex-col h-[500px]">
      {/* Voice Channels */}
      <div className="p-4 border-b border-gray-200 dark:border-border">
        <h3 className="font-semibold text-gray-900 dark:text-foreground mb-3">Voice Channels</h3>
        <div className="space-y-3">
          {mockVoiceChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <div key={index} className="flex justify-between items-center bg-gray-100 dark:bg-muted p-3 rounded-md">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">{channel.label}</div>
                    <div className="text-xs text-gray-600 dark:text-muted-foreground">{channel.participants}</div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">{channel.count} Connected</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transcript */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 dark:text-foreground mb-3">Transcript</h3>
        {mockTranscript.map((message, index) => (
          <div key={index} className="flex justify-start">
            <div className="max-w-xs px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
              <div className="font-medium text-xs mb-1">{message.sender}</div>
              <div className="text-sm">{message.text}</div>
              <div className="text-xs text-gray-500 dark:text-muted-foreground mt-1 text-right">
                {message.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-border">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleSendMessage}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border bg-red-50 dark:bg-red-950">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-red-900 dark:text-red-100">CVX - Cardiac Event</h2>
              <p className="text-sm text-red-700 dark:text-red-300">Emergency Response Active</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-border">
          {[
            { id: 'details', label: 'Details', icon: AlertTriangle },
            { id: 'media', label: 'Media', icon: Camera },
            { id: 'chat', label: 'Chat', icon: MessageCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex-1 flex items-center justify-center py-3 px-4 ${
                  activeTab === tab.id 
                    ? 'bg-red-50 text-red-700 border-b-2 border-red-600' 
                    : 'text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[600px]">
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'media' && renderMediaTab()}
          {activeTab === 'chat' && renderChatTab()}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-border bg-gray-50 dark:bg-muted">
          <div className="flex space-x-2">
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 mr-2" />
              View on Map
            </button>
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Team
            </button>
            <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center">
              <Phone className="w-4 h-4 mr-2" />
              Emergency Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}