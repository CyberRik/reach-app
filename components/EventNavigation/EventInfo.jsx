import { Link, useLocation } from "wouter";
import { ClipboardList, ImageIcon, PhoneCall, Map } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const isActive = (path) => location === path;

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around p-3">
        <Link href="/info">
          <div className="flex flex-col items-center">
            <ClipboardList
              size={20}
              className={
                isActive("/info") ? "text-emergency-red" : "text-gray-500"
              }
            />
            <span className="text-xs mt-1">Info</span>
          </div>
        </Link>

        <Link href="/media">
          <div className="flex flex-col items-center">
            <ImageIcon
              size={20}
              className={
                isActive("/media") ? "text-emergency-red" : "text-gray-500"
              }
            />
            <span className="text-xs mt-1">Media</span>
          </div>
        </Link>

        <Link href="/voice">
          <div className="flex flex-col items-center">
            <PhoneCall
              size={20}
              className={
                isActive("/voice") ? "text-emergency-red" : "text-gray-500"
              }
            />
            <span className="text-xs mt-1">Voice</span>
          </div>
        </Link>

        <Link href="/map">
          <div className="flex flex-col items-center">
            <Map
              size={20}
              className={
                isActive("/map") ? "text-emergency-red" : "text-gray-500"
              }
            />
            <span className="text-xs mt-1">Map</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}



