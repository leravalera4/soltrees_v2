// import { ObjectId } from "mongodb";

// export interface UserDocument {
//     userAddress: string;
//     paymentIds?: Array<string>;
//     trees: Array<ObjectId>; // array of tree ids
// }


// export interface TreeDocument {
//     position_x: string;
//     position_y: string;
//     handle: string;
//     profilePicUrl: string
//     description: string;
//     link: string;
//     size: string;
//     type: string;
// }




// // payloads

// export interface CreateUserPayload {
//     userAddress: string;
// }

// export interface CreateTreePayload {
//     userAddress: string;
//     position_x: string;
//     position_y: string;
//     handle: string;
//     description: string;
//     link: string;
//     size: string;
//     type: string;
// }

import { TreeCategory } from './types';
import { ObjectId, WithId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUserPayload {
    userAddress: string;
    uuid: string;
     clicks : number;
}

export interface UserDocument {
      uuid: string;
    _id: ObjectId;
    userAddress: string;
    paymentIds: string[];
        clicks: number;         // <-- add this
    background: string;  
    trees: ObjectId[];
    //  handle: string;
}

export interface CreateTreePayload {
    userAddress: string;
    position_x: string;
    position_y: string;
    clicks : number;
    handle: string;
    description: string;
    link: string;
    size: 'Small' | 'Medium' | 'Big' | 'Huge';
    type: 'classic' | 'bushy' | 'distorted';
    category: TreeCategory;
}

// Interface for the document as it exists in MongoDB
export interface TreeDocument {
  _id: ObjectId;
  position_x: string;
  position_y: string;
  handle: string;
  profilePicUrl: string;
  description: string;
  clicks: number;
  link: string;
  size: 'Small' | 'Medium' | 'Big' | 'Huge';
  type: 'classic' | 'bushy' | 'distorted';
  category: TreeCategory;
  userAddress: string;
}

// Interface for creating a new tree (without _id)
export interface CreateTreeDocument {
    position_x: string;
    position_y: string;
    handle: string;
    profilePicUrl: string;
    description: string;
     clicks : number;
    link: string;
    size: 'Small' | 'Medium' | 'Big' | 'Huge';
    type: 'classic' | 'bushy' | 'distorted';
    category: TreeCategory;
    userAddress: string;
} 

export interface CustomCategory {
  _id: ObjectId;
  title: string;
  description: string;
  color: string;
  createdBy: string;
  createdAt: Date;
} 