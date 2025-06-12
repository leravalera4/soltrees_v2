import React, { useEffect, useState } from 'react';
import { XIcon, Plus } from 'lucide-react';
import { TREE_CATEGORIES, CustomCategory, getCustomCategories, createCustomCategory } from '../utils/categories';

interface OnboardingModalProps {
  onClose: () => void;
  onSelectCategory: (category: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onClose,
  onSelectCategory
}) => {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFormData, setCustomFormData] = useState({
    title: '',
    description: '',
    color: '#4ade80'
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomCategories = async () => {
      const categories = await getCustomCategories();
      setCustomCategories(categories);
    };
    loadCustomCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (!customFormData.title.trim()) throw new Error('Title is required');
      if (!customFormData.description.trim()) throw new Error('Description is required');
      if (!customFormData.color) throw new Error('Color is required');
      const newCategory = await createCustomCategory({
        title: customFormData.title.trim(),
        description: customFormData.description.trim(),
        color: customFormData.color,
        createdBy: 'user' // This should be the actual user ID or wallet address
      });
      setCustomCategories(prev => [...prev, newCategory]);
      onSelectCategory(newCategory.id as string); // Auto-select the new category
      setShowCustomForm(false);
      setCustomFormData({
        title: '',
        description: '',
        color: '#4ade80'
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create category');
    }
  };

  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[600px] p-8 relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100">
          <XIcon className="w-5 h-5" />
        </button>
        <div className="space-y-6">
          {!showCustomForm ?
        // Main categories view
        <>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Why are you planting a tree?
                </h2>
                <p className="text-gray-600">
                  Choose your primary purpose to join the forest
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Main Categories</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(TREE_CATEGORIES).map(([key, category]) => <button key={key} onClick={() => onSelectCategory(key as string)} className="p-6 border rounded-xl hover:border-black transition-colors text-left group">
                      <h3 className="font-semibold text-lg mb-2">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-900">
                        {category.description}
                      </p>
                    </button>)}
                </div>
              </div>
              {/* {customCategories.length > 0 && <div className="space-y-4">
                  <h3 className="font-semibold">Community Categories</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {customCategories.map(category => <button key={category.id} onClick={() => onSelectCategory(category.id as string)} className="p-6 border rounded-xl hover:border-black transition-colors text-left group">
                        <h3 className="font-semibold text-lg mb-2">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-600 group-hover:text-gray-900">
                          {category.description}
                        </p>
                      </button>)}
                  </div>
                </div>} */}
              {/* <button onClick={() => setShowCustomForm(true)} className="w-full p-4 border-2 border-dashed rounded-xl hover:border-black transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-black">
                <Plus className="w-5 h-5" />
                Create Custom Category
              </button> */}
            </> :
        // Custom category form
        <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Create Custom Category
                </h2>
                <p className="text-gray-600">
                  Add your own category to the forest
                </p>
              </div>
              {formError && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {formError}
                </div>}
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category Title
                  </label>
                  <input type="text" value={customFormData.title} onChange={e => setCustomFormData(prev => ({
                ...prev,
                title: e.target.value
              }))} className="w-full p-2 border rounded" placeholder="e.g., Community Builder" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea value={customFormData.description} onChange={e => setCustomFormData(prev => ({
                ...prev,
                description: e.target.value
              }))} className="w-full p-2 border rounded h-24" placeholder="Describe the purpose of this category..." required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category Color
                  </label>
                  <input type="color" value={customFormData.color} onChange={e => setCustomFormData(prev => ({
                ...prev,
                color: e.target.value
              }))} className="w-full h-10 p-1 border rounded" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowCustomForm(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                    Create Category
                  </button>
                </div>
              </form>
            </div>}
        </div>
      </div>
    </div>;
};