import { Connection, clusterApiUrl } from "@solana/web3.js";
import { MongoClient, Collection, WithId, ObjectId } from "mongodb";
import { CreateUserPayload, TreeDocument, UserDocument } from "./interfaces";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = {
  MONGODB_URI: process.env.MONGODB_URI,
  MAIN_WALLET_PUBLIC_KEY: process.env.MAIN_WALLET_PUBLIC_KEY,
  X_BEARER_TOKEN: process.env.X_BEARER_TOKEN
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const MONGODB_URI = process.env.MONGODB_URI!;
const DATABASE_NAME = process.env.DATABASE_NAME || 'treessol';

export const PORT = process.env.PORT || 3000;

// X consts
export const xBearerToken = process.env.X_BEARER_TOKEN!;

// web3 consts
export const connection: Connection = new Connection("https://blissful-burned-firefly.solana-mainnet.quiknode.pro/c12294c79fe9c4671d8ba3f8a1c899e3abdc1d9f/", 'confirmed');
export const mainWalletPublicKey = process.env.MAIN_WALLET_PUBLIC_KEY!;

// init DB
export const client = new MongoClient(MONGODB_URI);
const collectionNameUsers = "users";
const collectionNameTrees = "trees";

// Properly type the collections with WithId to handle _id field
export const USERS: Collection<WithId<UserDocument>> = client.db(DATABASE_NAME).collection<WithId<UserDocument>>(collectionNameUsers);
export const TREES: Collection<WithId<TreeDocument>> = client.db(DATABASE_NAME).collection<WithId<TreeDocument>>(collectionNameTrees);
export const CUSTOM_CATEGORIES: Collection<WithId<CustomCategory>> = client.db(DATABASE_NAME).collection<WithId<CustomCategory>>('custom_categories');

export const TreeSizePrices = {
    Small: 0.1,
    Medium: 0.5,
    Big: 0.8,
    Huge: 1
} as const;

export interface CustomCategory {
  _id: ObjectId;
  title: string;
  description: string;
  color: string;
  createdBy: string;
  createdAt: Date;
} 