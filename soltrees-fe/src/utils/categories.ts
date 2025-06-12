export const TREE_CATEGORIES = {
  developer: {
    title: 'Web3 Developer',
    description: 'Looking to connect with other web3 developers or showcase your work',
    color: '#4ade80',
    position: {
      x: -20,
      z: -20,
      radius: 10
    }
  },
  networking: {
    title: 'Networking',
    description: 'Want to expand your professional network in web3',
    color: '#60a5fa',
    position: {
      x: 0,
      z: -20,
      radius: 10
    }
  },
  jobseeker: {
    title: 'Job Seeker',
    description: 'Looking for new opportunities in web3',
    color: '#f472b6',
    position: {
      x: 20,
      z: -20,
      radius: 10
    }
  },
  recruiter: {
    title: 'Recruiter',
    description: 'Hiring for web3 positions',
    color: '#fbbf24',
    position: {
      x: -20,
      z: 0,
      radius: 10
    }
  }
} as const;
export type TreeCategory = keyof typeof TREE_CATEGORIES;
// For custom categories
export interface CustomCategory {
  id: string;
  title: string;
  description: string;
  color: string;
  createdBy: string;
}
export const getCustomCategories = async (): Promise<CustomCategory[]> => {
  try {
    const response = await fetch('https://www.soltrees.io/getCustomCategories');
    if (!response.ok) throw new Error('Failed to fetch custom categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching custom categories:', error);
    return []; // Return empty array on error
  }
};
export const createCustomCategory = async (category: Omit<CustomCategory, 'id'>): Promise<CustomCategory> => {
  try {
    const response = await fetch('https://www.soltrees.io/createCustomCategory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(category)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating custom category:', error);
    throw error;
  }
};