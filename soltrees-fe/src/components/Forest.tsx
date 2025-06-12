import React, { useEffect, useMemo, useState } from 'react';
import { Scene3D } from './Scene3D';
import { Forest3D } from './Forest3D';
import { UserProfileModal } from './UserProfileModal';
import { getSolPrice } from '../utils/solana';
import { TREE_CATEGORIES, TreeCategory, getCustomCategories, CustomCategory } from '../utils/categories';
import { getTreesByCategory, updateUserBackground } from '../utils/api';

interface TreeData {
  id: string;
  position: {
    x: string;
    y: string;
  };
  userData: {
    handle: string;
    description: string;
    link: string;
    _id: string;
    profilePicUrl?: string;
  };
  size: 'Small' | 'Medium' | 'Big' | 'Huge';
  wallet_address: string;
  type: 'classic' | 'bushy' | 'distorted';
  category: TreeCategory;
}

interface ForestProps {
  trees: TreeData[];
  onRightClick: (x: string, y: string) => void;
  walletAddress: string | null;
  userCategory?: string;
  onUserProfileOpen: (_id: string) => void;
  userClicks: { [_id: string]: number };
}

export const Forest: React.FC<ForestProps> = ({
  trees,
  onRightClick,
  walletAddress,
  userCategory,
  onUserProfileOpen,
  userClicks
}) => {
  const [selectedUser, setSelectedUser] = useState<TreeData['userData'] | null>(null);
  const [selectedTree, setSelectedTree] = useState<{
    size: 'Small' | 'Medium' | 'Big' | 'Huge';
    type: 'classic' | 'bushy' | 'distorted';
  } | null>(null);
  const [solPrice, setSolPrice] = useState<number>(20);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortByCategory, setSortByCategory] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);

  useEffect(() => {
    const loadCustomCategories = async () => {
      const categories = await getCustomCategories();
      setCustomCategories(categories);
    };
    loadCustomCategories();
  }, []);



  const filteredTrees = useMemo(() => {
    if (!selectedCategory) return trees;
    return trees.filter(tree => tree.category === selectedCategory);
  }, [selectedCategory, trees]);

  const sortedTrees = useMemo(() => {
    if (!sortByCategory) return filteredTrees;
    return [...filteredTrees].sort((a, b) => {
      return a.category.localeCompare(b.category);
    });
  }, [filteredTrees, sortByCategory]);

  const handleUpdateBackground = async (background: string) => {
    if (selectedUser) {
      try {
        await updateUserBackground(selectedUser._id, background);
        setSelectedUser(prev => prev ? { ...prev, background } : null);
      } catch (error) {
        console.error('Error updating background:', error);
      }
    }
  };

  const handleTreeClick = (tree: TreeData) => {
    console.log('CLICKED TREE', tree.userData._id, 'at', new Date().toISOString());
    setSelectedUser(tree.userData);
    setSelectedTree({
      size: tree.size,
      type: tree.type
    });
    onUserProfileOpen(tree.userData._id);
  };

  return (
    <div className="w-full h-screen" onClick={(e) => e.stopPropagation()}>
      <div className="fixed top-20 right-4 z-10 flex gap-2">
        <select 
          value={selectedCategory || ''} 
          onChange={e => setSelectedCategory(e.target.value || null)} 
          className="bg-white/90 px-4 py-2 rounded-lg shadow-lg"
        >
          <option value="">All Categories</option>
          {Object.entries(TREE_CATEGORIES).map(([key, category]) => (
            <option key={key} value={key}>
              {category.title}
            </option>
          ))}
          {customCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
        <button 
          onClick={() => setSortByCategory(!sortByCategory)} 
          className={`bg-white/90 px-4 py-2 rounded-lg shadow-lg hover:bg-white ${
            sortByCategory ? 'bg-gray-100' : ''
          }`}
        >
          {sortByCategory ? 'Unsort' : 'Sort by Category'}
        </button>
      </div>
      <Scene3D>
        <Forest3D
          trees={sortedTrees}
          onRightClick={onRightClick}
          onTreeClick={handleTreeClick}
          walletAddress={walletAddress}
        />
      </Scene3D>
      <UserProfileModal 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
        tree={selectedTree} 
        category={selectedTree?.type} 
        clicks={selectedUser ? userClicks[selectedUser._id] || 0 : 0}
        onUpdateBackground={handleUpdateBackground}
        profilePicUrl={selectedUser?.profilePicUrl || ''}
      />
    </div>
  );
};