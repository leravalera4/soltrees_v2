import React, { useEffect, useState } from 'react';
import { XIcon, Eye, Palette, TreeDeciduous } from 'lucide-react';
import { TREE_CATEGORIES } from '../utils/categories';
const CARD_BACKGROUNDS = [
  'bg-gradient-to-br from-green-400 to-blue-500',
  'bg-gradient-to-br from-purple-400 to-pink-500',
  'bg-gradient-to-br from-yellow-400 to-orange-500',
  'bg-gradient-to-br from-blue-400 to-indigo-500',
  'bg-gradient-to-br from-pink-500 to-yellow-500',
  'bg-gradient-to-br from-emerald-400 to-cyan-400',
  'bg-gradient-to-br from-red-400 to-fuchsia-500'
];

function getUserBackground(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CARD_BACKGROUNDS.length;
  return CARD_BACKGROUNDS[index];
}

interface UserData {
  handle: string;
  description: string;
  category: string;
  profilePicUrl?: string;
  link: string;
  clicks?: number;
  background?: string;
}
interface UserProfileModalProps {
  user: UserData | null;
  profilePicUrl:UserData | null;
  category: UserData | null;
  onClose: () => void;
  onUpdateBackground?: (background: string) => void;
  tree?: {
    size: 'Small' | 'Medium' | 'Big' | 'Huge';
    type: 'classic' | 'bushy' | 'distorted';
  } | null;
  // category?: string;
  clicks: number;
}
export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  profilePicUrl,
  onClose,
  onUpdateBackground,
  tree = {
    size: 'Medium',
    type: 'classic'
  },
  category,
  clicks
}) => {
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [showTreePreview, setShowTreePreview] = useState(false);
  const [background, setBackground] = useState(
    user ? getUserBackground(user.handle || user.profilePicUrl || user.link || '') : CARD_BACKGROUNDS[0]
  );
  const [customBackground, setCustomBackground] = useState('');
  useEffect(() => {
    if (user) {
      setBackground(getUserBackground(user.handle || user.profilePicUrl || user.link || ''));
    }
  }, [user]);
  const handleBackgroundChange = (bg: string) => {
    setBackground(bg);
    onUpdateBackground?.(bg);
  };
  const handleCustomBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomBackground(value);
    onUpdateBackground?.(value);
  };
  if (!user) return null;
  const handleViewProfile = () => {
    window.open(user.link, '_blank');
  };
  console.log('UserProfileModal user:', user);
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`w-[400px] rounded-xl overflow-hidden ${background}`}>
        <div className="bg-white/10 backdrop-blur-md p-6 relative">
          <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-full hover:bg-white/20 text-white">
            <XIcon className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-4 text-white">
            <img
                src={user.profilePicUrl}
                alt={user.handle}
                className="w-full h-full rounded-full"
              />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-white">{user.handle}</h2>
              {/* <button onClick={() => setShowBackgrounds(!showBackgrounds)} className="p-1 rounded-full hover:bg-white/20 text-white" title="Customize background">
                <Palette className="w-4 h-4" />
              </button> */}
              <button onClick={() => setShowTreePreview(!showTreePreview)} className="p-1 rounded-full hover:bg-white/20 text-white" title="Preview tree">
                <TreeDeciduous className="w-4 h-4" />
              </button>
            </div>
            {showBackgrounds && <div className="space-y-4">
                <div className="flex gap-2">
                  {CARD_BACKGROUNDS.map(bg => <button key={bg} onClick={() => handleBackgroundChange(bg)} className={`w-8 h-8 rounded-full ${bg} ${background === bg ? 'ring-2 ring-white' : ''}`} />)}
                </div>
                {/* <div className="flex items-center gap-2">
                  <input type="color" value={customBackground} onChange={handleCustomBackground} className="w-8 h-8 rounded-full" />
                  <span className="text-white text-sm">Custom color</span>
                </div> */}
              </div>}
            <p className="text-white/90 mb-4">{user.description}</p>
            <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
              <Eye className="w-4 h-4" />
              <span>{clicks} profile views</span>
            </div>
            {showTreePreview && <div className="mb-4 p-4 bg-white/10 rounded-lg">
                <h3 className="text-white font-medium mb-2">Tree Details</h3>
                <p className="text-white/90">Size: {tree?.size}</p>
                <p className="text-white/90">Type: {tree?.type}</p>
              </div>}
            {user.category && <div className="mb-4 p-2 bg-white/10 rounded">
                <span className="text-white/90 text-sm">
                  Category: {TREE_CATEGORIES[user.category as keyof typeof TREE_CATEGORIES]?.title || user.category}
                </span>
              </div>}
            <a href={user.link} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline" style={{color: 'white'}}>
              {user.link}
            </a>
            <button onClick={handleViewProfile} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              View X Profile
            </button>
          </div>
        </div>
      </div>
    </div>;
};