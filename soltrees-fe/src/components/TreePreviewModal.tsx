import React from 'react';
import { XIcon } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Tree3D } from './Tree3D';
interface TreePreviewModalProps {
  onClose: () => void;
  onSelect: (type: 'classic' | 'bushy' | 'distorted') => void;
  selectedType: 'classic' | 'bushy' | 'distorted';
  selectedSize: 'Small' | 'Medium' | 'Big' | 'Huge';
}
export const TreePreviewModal: React.FC<TreePreviewModalProps> = ({
  onClose,
  onSelect,
  selectedType,
  selectedSize
}) => {
  const treeTypes = [{
    type: 'classic',
    name: 'Classic Pine',
    description: 'Traditional evergreen tree'
  }, {
    type: 'bushy',
    name: 'Bushy Oak',
    description: 'Full and rounded shape'
  }, {
    type: 'distorted',
    name: 'Twisted Elm',
    description: 'Unique and artistic form'
  }] as const;
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[800px] p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100">
          <XIcon className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Preview Trees</h2>
        <div className="grid grid-cols-3 gap-6">
          {treeTypes.map(({
          type,
          name,
          description
        }) => <div key={type} className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${selectedType === type ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`} onClick={() => onSelect(type)}>
              <div className="h-48 mb-4 bg-gray-50 rounded-lg overflow-hidden">
                <Canvas camera={{
              position: [0, 4, 8]
            }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <Tree3D position={[0, 0, 0]} username="" type={type} size={selectedSize} onClick={() => {}} />
                  <OrbitControls enableZoom={false} />
                </Canvas>
              </div>
              <h3 className="font-semibold mb-1">{name}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>)}
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Size Comparison</h3>
          <div className="h-32 relative">
            <Canvas camera={{
            position: [0, 3, 11]
          }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              {(['Small', 'Medium', 'Big', 'Huge'] as const).map((size, i) => <Tree3D key={size} position={[i * 2 - 3, 0, 0]} username={size} type={selectedType} size={size} onClick={() => {}} />)}
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>
        </div>
      </div>
    </div>;
};