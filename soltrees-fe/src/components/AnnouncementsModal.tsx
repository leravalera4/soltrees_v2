import React from 'react';
import { XIcon, Bell } from 'lucide-react';
interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}
interface AnnouncementsModalProps {
  onClose: () => void;
}
const ANNOUNCEMENTS: Announcement[] = [{
  id: '1',
  title: 'Welcome to Sol Trees!',
  content: 'Plant your tree and join our growing community.',
  date: '2025-05-22'
}, {
  id: '2',
  title: 'Tree Auctions Coming Soon 👀',
  content: 'Stay tuned.',
  date: '2025-05-22'
},
{
  id: '3',
  title: 'Tree Mini Games Coming Soon 👀',
  content: 'Stay tuned.',
  date: '2025-05-22'
}];
export const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({
  onClose
}) => {
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[500px] p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100">
          <XIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Announcements</h2>
        </div>
        <div className="space-y-4">
          {ANNOUNCEMENTS.map(announcement => <div key={announcement.id} className="p-4 border rounded-lg hover:border-black transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{announcement.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(announcement.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600">{announcement.content}</p>
            </div>)}
        </div>
      </div>
    </div>;
};