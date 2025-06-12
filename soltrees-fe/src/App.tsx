import React, { useEffect, useState } from "react";
import { Forest } from "./components/Forest";
import { PlantTreeForm } from "./components/PlantTreeForm";
import { WalletConnection } from "./components/WalletConnection";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { getPlantedTrees, savePlantedTree } from "./utils/supabase";
import {
  createTree,
  getAllTrees,
  createUser,
  incrementUserClicks,
  incrementTreeClicks,
} from "./utils/api";
import { OnboardingModal } from "./components/OnboardingModal";
import { TreeCategory } from "./utils/categories";
import { ZoneVisualization } from "./components/ZoneVisualization";
import { Trophy, Bell } from "lucide-react";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { AnnouncementsModal } from "./components/AnnouncementsModal";
import { RecentTreesPanel } from './components/RecentTreesPanel';
import { formatDistanceToNow } from 'date-fns';
import { useScene3D } from './components/Scene3D';

interface TreeData {
  id: string;
  position: {
    x: string;
    y: string;
  };
  userData: {
    handle: string;
    _id: string;
    description: string;
    link: string;
    profilePicUrl?: string;
    category: string;
  };
  size: "Small" | "Medium" | "Big" | "Huge";
  type: "classic" | "bushy" | "distorted";
  category: TreeCategory;
  wallet_address: string;
}

type UserCategory = string;

// Добавим компонент для блокировки мобильных устройств
function OnlyWebVersion() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#111827',
      color: 'white',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      textAlign: 'center',
    }}>
      <div>Web version only.<br/>Please open this site on a desktop browser.</div>
    </div>
  );
}

export function App() {
  const [formPosition, setFormPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const { isRotating } = useScene3D();
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [userClicks, setUserClicks] = useState<{ [_id: string]: number }>({});
  const [userCategory, setUserCategory] = useState<UserCategory | null>(null);

  // Проверка на мобильное устройство
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  if (isMobile) {
    return <OnlyWebVersion />;
  }

  useEffect(() => {
    const setupWallet = async () => {
      const { solana } = window.phantom || {};
      if (solana) {
        try {
          const resp = await solana.connect({
            onlyIfTrusted: true,
          });
          const address = resp.publicKey.toString();
          setWalletAddress(address);
          // Create user when wallet connects
          await createUser(address);
        } catch (err) {
          setWalletAddress(null);
        }
        // Listen for wallet changes
        solana.on("connect", (publicKey: any) => {
          console.log("Wallet connected in App:", publicKey.toString());
          setWalletAddress(publicKey.toString());
        });
        solana.on("disconnect", () => {
          console.log("Wallet disconnected in App");
          setWalletAddress(null);
        });
      }
    };
    setupWallet();
  }, []);

  useEffect(() => {
    const loadTrees = async () => {
      try {
        setLoading(true);
        const dbTrees = await getAllTrees();
        // Add a small delay to ensure trees are loaded
        await new Promise((resolve) => setTimeout(resolve, 500));
        setTrees(
          dbTrees.map((tree: any) => ({
            id: tree.id || tree._id,
            position: {
              x: String(parseFloat(tree.position_x || tree.position?.x || "0")),
              y: String(parseFloat(tree.position_y || tree.position?.y || "0")),
            },
            userData: {
              handle: tree.handle || tree.userData?.handle || "",
              _id: tree._id || "",
              description: tree.description || tree.userData?.description || "",
              link: tree.link || tree.userData?.link || "",
              profilePicUrl: tree.profilePicUrl || "",
              category: tree.category || tree.userData?.category || "",
            },
            size: tree.size || "Small",
            type: tree.type || "classic",
            category: (tree.category as TreeCategory) || "developer",
            wallet_address: tree.userAddress || tree.wallet_address,
          }))
        );
      } catch (error) {
        console.error("Error loading trees:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTrees();
  }, []);

  const isWithinTerrain = (x: number, y: number) => {
    // Your terrain is 200x200, centered at 0,0
    return x >= -100 && x <= 100 && y >= -100 && y <= 100;
  };

  const handleRightClick = (x: number, y: number) => {
    if (!isWithinTerrain(x, y)) return; // Prevent planting outside terrain
    setFormPosition({ x, y });
  };

  const handlePlantTree = async (
    userData: TreeData["userData"],
    walletAddress: string,
    size: "Small" | "Medium" | "Big" | "Huge",
    type: "classic" | "bushy" | "distorted",
    category: TreeCategory | null
  ) => {
    try {
      const payload = {
        position_x: formPosition?.x.toString() || "0",
        position_y: formPosition?.y.toString() || "0",
        userAddress: walletAddress,
        handle: userData.handle,
        description: userData.description,
        profilePicUrl: userData.profilePicUrl,
        link: userData.link,
        size,
        type,
        category: (category as TreeCategory) || "developer",
      };
      const response = await createTree(payload);
      setFormPosition(null);
      // После посадки дерева — обновить список с бэка:
      const dbTrees = await getAllTrees();
      setTrees(
        dbTrees.map((tree: any) => ({
          id: tree.id || tree._id,
          position: {
            x: String(parseFloat(tree.position_x || tree.position?.x || "0")),
            y: String(parseFloat(tree.position_y || tree.position?.y || "0")),
          },
          userData: {
            handle: tree.handle || tree.userData?.handle || "",
            _id: tree._id || "",
            description: tree.description || tree.userData?.description || "",
            link: tree.link || tree.userData?.link || "",
            profilePicUrl: tree.profilePicUrl || "",
            category: tree.category || tree.userData?.category || "",
          },
          size: tree.size || "Small",
          type: tree.type || "classic",
          category: (tree.category as TreeCategory) || "developer",
          wallet_address: tree.userAddress || tree.wallet_address,
        }))
      );
    } catch (error) {
      console.error("Error saving tree:", error);
      throw error;
    }
  };

  const handleDeleteTree = (treeId: string) => {
    setTrees((prevTrees) => prevTrees.filter((tree) => tree.id !== treeId));
  };

  const uniqueUsers = new Set(trees.map((tree) => tree.userData.handle)).size;

  const handleTreeProfileOpen = async (treeId: string) => {
    try {
      const newClicks = await incrementTreeClicks(treeId);
      setUserClicks((prev) => ({
        ...prev,
        [treeId]: newClicks,
      }));
    } catch (error) {
      console.error("Error updating clicks:", error);
    }
  };

  // Helper to get most recent trees
  const mostRecentTrees = trees
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, 4)
    .map(tree => ({
      _id: tree.id,
      profilePicUrl: tree.userData.profilePicUrl || '',
      displayName: tree.userData.handle,
      handle: tree.userData.handle,
      timeAgo: '',
      verified: true
    }));

  console.log('trees:', trees.map(t => t.userData._id));

  return (
    <ErrorBoundary>
      <main className="w-full h-screen relative">
        <div style={{paddingTop:'3%'}}className="absolute top-8 left-8 z-50 select-none">
          <h1 style={{fontSize:'2.5rem'}} className="text-5xl font-bold text-white drop-shadow-lg mb-2">Sol Trees</h1>
          <div style={{fontSize:'1rem'}}className="text-xl text-white/90 drop-shadow-md max-w-2xl">
            RIGHT CLICK to plant a Tree 🌳
          </div>
        </div>
        <RecentTreesPanel trees={mostRecentTrees} />
        <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
          <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
            🌳 {trees.length} trees planted so far! 20% of the profits go to <a href="https://plant.ecosia.org/collections/trees" target="_blank" rel="noopener noreferrer" className="text-blue-500">Ecosia</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLeaderboard(true)}
              className="bg-white/90 px-4 py-2 rounded-lg shadow-lg hover:bg-white transition-colors flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={() => setShowAnnouncements(true)}
              className="bg-white/90 px-4 py-2 rounded-lg shadow-lg hover:bg-white transition-colors flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Announcements</span>
            </button>
            <a
              href="https://x.com/_soltrees"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="ml-2"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.162 5.656c-.793.352-1.646.59-2.542.698a4.48 4.48 0 0 0 1.962-2.475 8.94 8.94 0 0 1-2.828 1.08A4.48 4.48 0 0 0 11.07 9.03a12.72 12.72 0 0 1-9.24-4.685 4.48 4.48 0 0 0 1.39 5.98A4.44 4.44 0 0 1 2 9.13v.057a4.48 4.48 0 0 0 3.59 4.39c-.4.11-.82.17-1.25.17-.31 0-.6-.03-.89-.08a4.48 4.48 0 0 0 4.18 3.11A8.98 8.98 0 0 1 2 19.54a12.7 12.7 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.78 0-.2 0-.39-.01-.58a9.1 9.1 0 0 0 2.23-2.32z"
                  fill="#fff"
                />
              </svg>
            </a>
            <a
              href="https://t.me/+rEIqSE_55lM3NzMy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="ml-2"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21.944 4.485a1.5 1.5 0 0 0-1.62-.22L3.5 11.09a1.5 1.5 0 0 0 .13 2.8l3.7 1.23 1.42 4.25a1.5 1.5 0 0 0 2.7.22l2.02-3.13 3.7 2.73a1.5 1.5 0 0 0 2.36-.88l2.5-12a1.5 1.5 0 0 0-.09-.82zM9.6 15.13l-.98-2.93 7.13-5.7-6.15 6.62zm1.7 4.12l-1.2-3.6 2.7-2.9-1.5 6.5zm7.1-2.1l-3.7-2.73a1.5 1.5 0 0 0-2.1.32l-2.02 3.13 1.5-6.5 7.13-5.7-2.81 11.48z"
                  fill="#fff"
                />
              </svg>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg">
              👥 {uniqueUsers} users
            </div>
            <WalletConnection
              onWalletChange={setWalletAddress}
              currentAddress={walletAddress}
            />
          </div>
        </div>
        {showLeaderboard && (
          <LeaderboardModal
            onClose={() => setShowLeaderboard(false)}
            users={Array.from(
              trees.reduce((acc, tree) => {
                const walletAddress = tree.wallet_address;
                const handle = tree.userData.handle;
                if (!acc.has(walletAddress)) {
                  acc.set(walletAddress, { walletAddress, _id: walletAddress, handle, treeCount: 0, trees: [] });
                }
                acc.get(walletAddress).treeCount += 1;
                acc.get(walletAddress).trees.push({ size: tree.size });
                return acc;
              }, new Map())
            ).map(([, { walletAddress, _id, handle, treeCount, trees }]) => ({
              walletAddress,
              _id,
              handle,
              treeCount,
              trees,
            }))}
          />
        )}
        {showAnnouncements && (
          <AnnouncementsModal onClose={() => setShowAnnouncements(false)} />
        )}
        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-white">
            <div className="text-xl">Loading Forest...</div>
          </div>
        ) : (
          <>
            <Forest
              trees={trees}
              onRightClick={(x, y) => handleRightClick(Number(x), Number(y))}
              walletAddress={walletAddress}
              onDeleteTree={handleDeleteTree}
              userClicks={userClicks}
              onUserProfileOpen={handleTreeProfileOpen}
            />
            <ZoneVisualization />
          </>
        )}
        {!isRotating && formPosition && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <PlantTreeForm
              position={formPosition}
              onClose={() => setFormPosition(null)}
              onPlant={(userData, walletAddress, size, type) =>
                handlePlantTree(
                  {
                    ...userData,
                    _id: '',
                    category: userCategory || '',
                    profilePicUrl: (userData as any).profilePicUrl || ''
                  },
                  walletAddress,
                  size,
                  type,
                  null
                )
              }
              walletAddress={walletAddress}
              category={userCategory || ''}
            />
          </div>
        )}
      </main>
    </ErrorBoundary>
  );
}
