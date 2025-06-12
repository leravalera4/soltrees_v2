import React, { useEffect, useState } from 'react';
import { WalletIcon } from 'lucide-react';
interface WalletConnectionProps {
  onWalletChange: (address: string | null) => void;
  currentAddress: string | null;
}
export const WalletConnection: React.FC<WalletConnectionProps> = ({
  onWalletChange,
  currentAddress
}) => {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    setConnected(!!currentAddress);
  }, [currentAddress]);
  const handleConnect = async () => {
    try {
      const {
        solana
      } = window.phantom || {};
      if (!solana) {
        window.open('https://phantom.app/', '_blank');
        return;
      }
      const resp = await solana.connect();
      console.log('Connected with public key:', resp.publicKey.toString());
      onWalletChange(resp.publicKey.toString());
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };
  const handleDisconnect = async () => {
    try {
      const {
        solana
      } = window.phantom || {};
      if (solana) {
        await solana.disconnect();
        onWalletChange(null);
      }
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };
  return <button onClick={connected ? handleDisconnect : handleConnect} className="bg-white/90 px-4 py-2 rounded-lg shadow-lg hover:bg-white transition-colors flex items-center gap-2">
      <WalletIcon className="w-4 h-4" />
      {connected && currentAddress ? `Connected: ${currentAddress.slice(0, 4)}...${currentAddress.slice(-4)}` : 'Connect Phantom'}
    </button>;
};