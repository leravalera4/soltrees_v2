// import React from 'react';
// interface TreeProps {
//   position: {
//     x: number;
//     y: number;
//   };
//   username: string;
//   onClick: () => void;
// }
// export const Tree: React.FC<TreeProps> = ({
//   position,
//   username,
//   onClick
// }) => {
//   return <div className="absolute cursor-pointer group" style={{
//     left: position.x,
//     top: position.y
//   }} onClick={onClick}>
//       {/* Tree Label */}
//       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full shadow-md text-sm whitespace-nowrap">
//         {username}
//       </div>
//       {/* Simple Tree Shape */}
//       <div className="relative">
//         <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-green-600" />
//         <div className="w-2 h-6 bg-brown-600 mx-auto" />
//       </div>
//     </div>;
// };

import React from 'react';
interface TreeProps {
  position: {
    x: number;
    y: number;
  };
  username: string;
  profilePicUrl: string;
  onClick: () => void;
  type?: 'classic' | 'bushy' | 'distorted';
}
export const Tree: React.FC<TreeProps> = ({
  position,
  username,
  onClick,
  type = 'classic'
}) => {
  return <div className="absolute cursor-pointer group" style={{
    left: position.x,
    top: position.y
  }} onClick={onClick}>
      {/* Tree Label */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full shadow-md text-sm whitespace-nowrap">
        {username}
      </div>

      {/* Tree Shape */}
      <div className="relative flex flex-col items-center">
        {type === 'classic' && <>
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-green-600 mb-[-8px]" />
            <div className="w-2 h-6 bg-[#8b5a2b]" />
          </>}
        {type === 'bushy' && <>
            <div className="w-[50px] h-[50px] rounded-full bg-green-700 mb-[-8px]" />
            <div className="w-2 h-6 bg-[#8b5a2b]" />
          </>}
        {type === 'distorted' && <>
            <div className="w-0 h-0 border-l-[30px] border-r-[10px] border-b-[60px] border-l-transparent border-r-transparent border-b-green-900 transform -skew-x-[15deg] mb-[-8px]" />
            <div className="w-2 h-6 bg-[#8b5a2b]" />
          </>}
      </div>
    </div>;
};