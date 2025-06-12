import { TreeCategory } from './categories';

const API_URL = 'https://www.soltrees.io'; // Update this to match your backend URL
export const createUser = async (userAddress: string) => {
  try {
    const response = await fetch(`${API_URL}/createUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userAddress
      })
    });
    if (!response.ok) throw new Error('Failed to create user');
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export interface TreeDocument {
    _id: string;
    position_x: string;
    position_y: string;
    handle: string;
    profilePicUrl: string;
    description: string;
    link: string;
    size: 'Small' | 'Medium' | 'Big' | 'Huge';
    type: 'classic' | 'bushy' | 'distorted';
    category: TreeCategory;
    userAddress: string;
}

export interface CreateTreePayload {
    userAddress: string;
    position_x: string;
    position_y: string;
    handle: string;
    description: string;
    link: string;
    size: 'Small' | 'Medium' | 'Big' | 'Huge';
    type: 'classic' | 'bushy' | 'distorted';
    category: TreeCategory;
    uuid?: string;
}

export const createTree = async (payload: CreateTreePayload): Promise<TreeDocument> => {
    const response = await fetch(`${API_URL}/createTree`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create tree');
    return response.json();
};

export const getAllTrees = async (): Promise<TreeDocument[]> => {
    const response = await fetch(`${API_URL}/getAllTrees`);
    if (!response.ok) throw new Error('Failed to fetch trees');
    return response.json();
};

export const getTreesByCategory = async (category: TreeCategory): Promise<TreeDocument[]> => {
    const response = await fetch(`${API_URL}/getTreesByCategory?category=${category}`);
    if (!response.ok) throw new Error('Failed to fetch trees by category');
    return response.json();
};

export const getUserTrees = async (userAddress: string) => {
  try {
    const response = await fetch(`${API_URL}/getUserTrees?userAddress=${userAddress}`);
    if (!response.ok) throw new Error('Failed to fetch user trees');
    const trees = await response.json();
    return trees.map((tree: any) => ({
      id: tree._id,
      position: {
        x: tree.position_x,
        y: tree.position_y
      },
      userData: {
        handle: tree.handle,
        description: tree.description || '',
        link: tree.link || ''
      },
      size: tree.size,
      type: tree.type,
      userAddress: tree.userAddress
    }));
  } catch (error) {
    console.error('Error fetching user trees:', error);
    throw error;
  }
};

export const incrementUserClicks = async (uuid: string) => {
  try {
    console.log("UUID получен:", uuid); // ✅ Проверка uuid
    const response = await fetch(`${API_URL}/user/${uuid}/click`, {
      method: 'POST',     //take the id from all trees Obj
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to increment clicks');
    const data = await response.json();
    console.log('Incremented clicks:', data);
    return data.clicks;
  } catch (error) {
    console.error('Error incrementing clicks:', error);
    throw error;
  }
};

export const updateUserHandle = async (userAddress: string, handle: string) => {
  try {
    const response = await fetch(`${API_URL}/user/${userAddress}/handle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ handle })
    });
    if (!response.ok) throw new Error('Failed to update handle');
    return await response.json();
  } catch (error) {
    console.error('Error updating handle:', error);
    throw error;
  }
};

export const updateUserBackground = async (uuid: string, background: string) => {
  try {
    const response = await fetch(`${API_URL}/user/${uuid}/background`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ background })
    });
    if (!response.ok) throw new Error('Failed to update background');
    const data = await response.json();
    return data.background;
  } catch (error) {
    console.error('Error updating background:', error);
    throw error;
  }
};

export const incrementTreeClicks = async (treeId: string) => {
  const response = await fetch(`${API_URL}/tree/${treeId}/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  console.log('Response:', response);
  if (!response.ok) throw new Error('Failed to increment clicks');
  const data = await response.json();
  console.log('data:', data);
  return data.clicks;
};