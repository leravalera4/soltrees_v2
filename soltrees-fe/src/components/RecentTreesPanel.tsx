import React from 'react';

interface RecentTree {
  _id: string;
  profilePicUrl: string;
  displayName: string;
  handle: string;
  timeAgo: string;
  verified?: boolean;
}

export const RecentTreesPanel: React.FC<{ trees: RecentTree[] }> = ({ trees }) => (
  <div className="absolute left-1/2 top-40 transform -translate-x-1/2 bg-white/60 rounded-2xl shadow-lg p-6 w-[400px] backdrop-blur-md">
    <h2 className="text-xl font-bold text-center mb-4">Most recent trees</h2>
    <div className="space-y-3">
      {trees.map(tree => (
        <div key={tree._id} className="flex items-center gap-3 bg-white/40 rounded-xl p-3">
          <img src={tree.profilePicUrl} alt={tree.handle} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <div className="font-semibold flex items-center gap-1">
              {tree.displayName || tree.handle}
              {tree.verified && <span className="text-blue-500">✔️</span>}
            </div>
            <div className="text-gray-600 text-sm">@{tree.handle} <span className="ml-2">{tree.timeAgo}</span></div>
          </div>
        </div>
      ))}
    </div>
  </div>
); 