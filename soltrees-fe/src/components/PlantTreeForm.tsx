import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { sendSolanaTransaction, convertUSDToSOL } from '../utils/solana';
import { TREE_CATEGORIES, TreeCategory, getCustomCategories, CustomCategory } from '../utils/categories'; // Updated import
import { TreePreviewModal } from './TreePreviewModal';

declare global {
  interface Window {
    phantom?: any;
    solana?: any;
  }
}

interface TreeSize {
  name: string;
  sol: number;
}
const TREE_SIZES: TreeSize[] = [{
  name: 'Small',
  sol: 0.1
}, {
  name: 'Medium',
  sol: 0.5
}, {
  name: 'Big',
  sol: 0.8
}, {
  name: 'Huge',
  sol: 1
}];
interface TreeData {
  userData: {
    handle: string;
    description: string;
    link: string;
  };
}
interface PlantTreeFormProps {
  position: {
    x: number;
    y: number;
  } | null;
  onClose: () => void;
  onPlant: (userData: TreeData['userData'], walletAddress: string, size: 'Small' | 'Medium' | 'Big' | 'Huge', type: 'classic' | 'bushy' | 'distorted') => void;
  walletAddress: string | null;
  category: string;
}
const TREE_TYPES = ['classic', 'bushy', 'distorted'] as const;

interface FormState {
  handle: string;
  description: string;
  link: string;
  selectedSize: TreeSize;
  selectedType: 'classic' | 'bushy' | 'distorted';
  category: string;
}

const initialFormState: FormState = {
  handle: '',
  description: '',
  link: '',
  selectedSize: TREE_SIZES[0],
  selectedType: 'classic',
  category: ''
};

export async function fetchSolPrice() {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
  const data = await res.json();
  console.log(data.solana.usd)
  return data.solana.usd;
}


export const PlantTreeForm: React.FC<PlantTreeFormProps> = ({
  position,
  onClose,
  onPlant,
  walletAddress,
  category
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [solPrice, setSolPrice] = useState<number | null>(null);

  useEffect(() => {
    const loadCustomCategories = async () => {
      const categories = await getCustomCategories();
      setCustomCategories(categories);
    };
    loadCustomCategories();
  }, []);

  useEffect(() => {
    async function getPrice() {
      try {
        const price = await fetchSolPrice();
        setSolPrice(price);
      } catch (e) {
        setSolPrice(null);
      }
    }
    getPrice();
    const interval = setInterval(getPrice, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  if (!position) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { phantom } = window;
      const wallet = window.solana || phantom;
      console.log('Wallet object:', wallet);
      console.log('Wallet publicKey:', wallet?.publicKey);
      if (!wallet || !wallet.publicKey) {
        throw new Error('Please connect your wallet first!');
      }
      // Basic validation
      if (!formData.handle) throw new Error('Handle is required');
      if (!formData.description) throw new Error('Description is required');
      if (!formData.link) throw new Error('Link is required');
      // Send the payment transaction
      console.log('Starting payment with wallet:', walletAddress);
      console.log('Amount to send:', formData.selectedSize.sol);
      const signature = await sendSolanaTransaction(formData.selectedSize.sol, wallet);
      console.log('Payment successful! Signature:', signature);
      // Save the tree after payment success
      const handle = formData.handle.replace('@', '');
      const profileLink = formData.link || `https://x.com/${handle}`;
      await onPlant({
        handle: formData.handle,
        description: formData.description.trim(),
        link: profileLink.trim()
      }, walletAddress || '', formData.selectedSize.name as 'Small' | 'Medium' | 'Big' | 'Huge', formData.selectedType);
      setFormData(initialFormState);
      onClose();
    } catch (error) {
      console.error('Detailed error:', error);
      setError(error instanceof Error ? error.message : 'Failed to plant tree. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSizeSelect = (size: TreeSize) => {
    setFormData(prev => ({
      ...prev,
      selectedSize: size
    }));
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 m-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Plant your tree!</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">X Handle</label>
              <input type="text" name="handle" value={formData.handle} onChange={handleChange} placeholder="@username" className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Tell us about yourself" className="w-full p-2 border rounded h-24" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link</label>
              <input type="url" name="link" value={formData.link} onChange={handleChange} placeholder="https://soltrees.io" className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a category</option>
                {Object.entries(TREE_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.title}</option>
                ))}
                {customCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {TREE_SIZES.map((size) => (
                <button
                  key={size.name}
                  type="button"
                  onClick={() => handleSizeSelect(size)}
                  className={`flex flex-col items-center p-4 border rounded transition-colors focus:outline-none ${formData.selectedSize.name === size.name ? 'bg-black text-white border-black' : 'hover:bg-gray-50'}`}
                >
                  <div className="font-bold">{size.name}</div>
                  <div className="text-lg font-semibold">
                    {size.sol} SOL
                  </div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {TREE_TYPES.map(type => <button key={type} type="button" onClick={() => setFormData(prev => ({
              ...prev,
              selectedType: type
            }))} className={`p-3 rounded border transition-colors ${formData.selectedType === type ? 'bg-black text-white' : 'hover:bg-gray-50'}`}>
                  <div className="font-medium capitalize">{type}</div>
                </button>)}
            </div>
            <div className="flex justify-center mt-6">
              <button type="button" onClick={() => setShowPreview(true)} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
                Preview Trees
              </button>
            </div>
            {showPreview && <TreePreviewModal onClose={() => setShowPreview(false)} onSelect={type => {
            setFormData(prev => ({
              ...prev,
              selectedType: type
            }));
            setShowPreview(false);
          }} selectedType={formData.selectedType} selectedSize={formData.selectedSize.name as 'Small' | 'Medium' | 'Big' | 'Huge'} />}
            <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400">
              {loading
                ? 'Processing...'
                : `Plant Tree (${formData.selectedSize.sol} SOL)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};