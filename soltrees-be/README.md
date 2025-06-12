# 🌳 Tree API – Quick Start Guide

This README shows how to interact with your Express + MongoDB API using **Axios** (TypeScript). Each section provides:

1. **Endpoint summary**
2. **Request payload / query params**
3. **Axios call snippet**

> **Tip ✏️** Set an environment variable for the base URL so you can switch between `localhost` and production easily.

```ts
// src/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ?? "http://localhost:4000", // adjust port
  headers: { "Content-Type": "application/json" }
});
```

---

## 1. `POST /createUser`

Creates a new user document.

| Field         | Type   | Required | Example           |
| ------------- | ------ | -------- | ----------------- |
| `userAddress` | string | ✅        | `"0x1234...abcd"` |

```ts
interface CreateUserPayload {
  userAddress: string;
}

export const createUser = async (payload: CreateUserPayload) => {
  const { data } = await api.post("/createUser", payload);
  return data;  // newly‑created user document
};
```

---

## 2. `POST /createTree`

Adds a tree and links it to a user in one go.

| Field         | Type   | Required | Example           |
| ------------- | ------ | -------- | ----------------- |
| `userAddress` | string | ✅        | `"0x1234..."`     |
| `position_x`  | string | ✅        | `"51"`            |
| `position_y`  | string | ✅        | `"108"`           |
| `handle`      | string | ✅        | `"@blockOps"`     |
| `description` | string | ✅        | `"My first tree"` |
| `link`        | string |          | `"https://..."`   |
| `size`        | string | ✅        | `"large"`         |
| `type`        | string | ✅        | `"oak"`           |

```ts
interface CreateTreePayload {
  userAddress: string;
  position_x: string;
  position_y: string;
  handle: string;
  description: string;
  link: string;
  size: string;
  type: string;
}

export const createTree = async (payload: CreateTreePayload) => {
  const { data } = await api.post("/createTree", payload);
  return data; // tree document returned from the server
};
```

---

## 3. `GET /getUserTrees`

Returns **all trees** owned by a specific user.

| Query Param   | Type   | Required | Example       |
| ------------- | ------ | -------- | ------------- |
| `userAddress` | string | ✅        | `"0x1234..."` |

```ts
export const getUserTrees = async (userAddress: string) => {
  const { data } = await api.get("/getUserTrees", {
    params: { userAddress }
  });
  return data; // Tree[]
};
```

---

## 4. `GET /getAllTrees`

Fetches **every** tree in the database.

```ts
export const getAllTrees = async () => {
  const { data } = await api.get("/getAllTrees");
  return data; // Tree[]
};
```

---

## 🛠️ Running the examples

1. `npm i axios` (or `pnpm add axios`)
2. Create a `.env` file and set `REACT_APP_API_URL=http://localhost:4000` (or your deployed URL).
3. Import the helper functions above in your React/Node code and call them as needed.

```ts
import { createUser, createTree, getUserTrees, getAllTrees } from "./api";

await createUser({ userAddress: "0x1234..." });
await createTree({
  userAddress: "0x1234...",
  position_x: "51",
  position_y: "108",
  handle: "@blockOps",
  description: "First planting 🌳",
  link: "https://joe.com",
  size: "Large",
  type: "classic"
});

const myTrees = await getUserTrees("0x1234...");
console.log(myTrees);

const allTrees = await getAllTrees();
console.table(allTrees);
```

Go plant some trees! 🌱
