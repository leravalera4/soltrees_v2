import React from "react";
import { XIcon, Trophy } from "lucide-react";

interface Tree {
  size: "Small" | "Medium" | "Big" | "Huge";
}

interface LeaderboardEntry {
  walletAddress: string;
  _id: string;
  handle: string;
  treeCount: number;
  trees: Tree[];
}

interface LeaderboardModalProps {
  onClose: () => void;
  users: LeaderboardEntry[];
}

const OXYGEN_PER_TYPE = {
  Small: 60,
  Medium: 120,
  Big: 200,
  Huge: 300,
};

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  onClose,
  users,
}) => {
  console.log("Leaderboard users:", users);
  const sortedUsers = [...users].sort((a, b) => b.treeCount - a.treeCount);
  const topUsers = sortedUsers.slice(0, 3); // Show top 10
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[500px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
        >
          <XIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Leaderboard</h2>
        </div>
        <div className="space-y-2">
          {topUsers.map((user, index) => (
            <div
              key={user.walletAddress}
              className={`w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg ${
                index === 0
                  ? "bg-yellow-50"
                  : index === 1
                  ? "bg-gray-50"
                  : index === 2
                  ? "bg-orange-50"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? "bg-yellow-500 text-white"
                      : index === 1
                      ? "bg-gray-500 text-white"
                      : index === 2
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="font-medium">@{user.handle}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{user.treeCount}</span>
                <span className="text-gray-500">trees</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{user.treeCount * 120}</span>
                <span className="text-gray-500">kg O₂/year 🌬️</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
