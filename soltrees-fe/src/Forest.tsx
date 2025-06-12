import React, { useEffect, useState } from 'react';
import { Scene3D } from './Scene3D';
import { Tree3D } from './Tree3D';
import { UserProfileModal } from './UserProfileModal';
// ... rest of imports

export const Forest: React.FC<ForestProps> = ({
  trees,
  onRightClick
}) => {
  // ... existing state and effects

  return <div className="w-full h-screen" onContextMenu={handleContextMenu}>
      <Scene3D>
        {trees.map(tree => <Tree3D key={tree.id} position={[tree.position.x, 0, tree.position.y]} username={tree.userData.handle} userImage={tree.userData.image} size={tree.size || 'Small'} onClick={() => setSelectedUser(tree.userData)} isOwner={walletAddress === tree.wallet_address} />)}
      </Scene3D>
      <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>;
};