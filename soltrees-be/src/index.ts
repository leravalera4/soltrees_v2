import express, { Request, Response } from "express";
import cors from "cors";
import { USERS, TREES, PORT, TreeSizePrices, xBearerToken, CUSTOM_CATEGORIES } from "./constants";
import { CreateUserPayload, CreateTreePayload, TreeDocument, CreateTreeDocument, UserDocument } from "./interfaces";
import { checkSolTransfer } from "./helpers/checkSolTransfer";
import { ObjectId } from "mongodb";
import { TreeCategory } from "./types";
import { v4 as uuidv4 } from 'uuid';
import { Server as WebSocketServer } from 'ws';
import http from 'http';
const app = express();

app.use(cors({
  origin: "https://soltrees.io",
}));

app.use(express.json());

app.get("/", async (req: Request, res: Response): Promise<any> => {
  return res.status(200).json("healthy");
});

const server = http.createServer(app); // <-- create HTTP server from Express app

const wss = new WebSocketServer({ server }); 

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function broadcastBirds() {
  const data = JSON.stringify({ type: 'birds', birds });
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(data);
    }
  });
}

function randomPositionInSquare(halfSize = 10) {
  return {
    x: Math.random() * 2 * halfSize - halfSize, // [-10, 10]
    y: 0,
    z: Math.random() * 2 * halfSize - halfSize
  }
}

let birds = Array.from({ length: 5 }).map((_, i) => ({
  index: i,
  position: randomPositionInSquare(),
  direction: randomDirection(),
  velocityY: 0,
}))

function randomDirection() {
  const angle = Math.random() * 2 * Math.PI;
  return {
    x: Math.cos(angle),
    y: 0,
    z: Math.sin(angle)
  };
}

setInterval(() => {
  for (const bird of birds) {
    // Случайно меняем направление (например, с вероятностью 1% каждый тик)
    if (Math.random() < 0.01) {
      bird.direction = randomDirection();
    }

    bird.position.x += bird.direction.x * 0.05;
    bird.position.y += bird.direction.y * 0.05;
    bird.position.z += bird.direction.z * 0.05;

    // Границы мира: если вышла за пределы, отражаем направление
const boundary = 40
const speed = 0.05

bird.position.x += bird.direction.x * speed
bird.position.z += bird.direction.z * speed
bird.position.y = 0 // ходим по земле

if (Math.abs(bird.position.x) > boundary) {
  bird.direction.x = -bird.direction.x
  bird.position.x = Math.sign(bird.position.x) * (boundary - 0.1)
}

if (Math.abs(bird.position.z) > boundary) {
  bird.direction.z = -bird.direction.z
  bird.position.z = Math.sign(bird.position.z) * (boundary - 0.1)
}

    // Гравитация для прыжка
if (bird.position.y > 0) {
  bird.position.y -= 0.05; // было 0.2
  if (bird.position.y < 0) bird.position.y = 0;
}
  }
  broadcastBirds();
}, 100);




wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'birds', birds }));

  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === 'jump') {
        const bird = birds.find(b => b.index === data.index);
        if (bird) {
          bird.position.y = 1;
          broadcastBirds();
        }
      }
    } catch (e) {
      console.error("Invalid message received:", msg);
    }
  });
});



app.post("/createUser", async (req: Request, res: Response): Promise<any> => {
  const payload: CreateUserPayload = req.body;

  const document = await USERS.findOne({ userAddress: payload.userAddress});
  console.log("document", document);

  if(!document) {
    const newUser: Omit<UserDocument, '_id'> = {
      uuid: uuidv4(),
      userAddress: payload.userAddress,
      paymentIds: [],
      trees: [],
      clicks: 0,
      background: '',
    };
     console.log("newUSer", newUser);
    await USERS.insertOne(newUser as any); // Type assertion needed due to MongoDB's typing
  }
  return res.status(200).json("user created");
});

app.post("/createTree", async (req: Request, res: Response): Promise<any> => {
  const payload: CreateTreePayload = req.body;

  const treeType = payload.size;
  let paymentAmountToCheck = 0;

  if (treeType == "Small") {
    paymentAmountToCheck = TreeSizePrices.Small;
  }
  else if (treeType == "Medium") {
    paymentAmountToCheck = TreeSizePrices.Medium;
  }
  else if (treeType == "Big") {
    paymentAmountToCheck = TreeSizePrices.Big;
  }
  else if (treeType == "Huge") {
    paymentAmountToCheck = TreeSizePrices.Huge;
  }

  // check payment first
  const checkPayment = await checkSolTransfer(payload.userAddress, paymentAmountToCheck);
  if (!checkPayment) {
    return res.status(402).json({ error: "Payment not found" });
  }

  async function avatarExists(handle: string): Promise<boolean> {
    const res = await fetch(`https://unavatar.io/x/${handle}`, { method: "HEAD" });
    return res.ok;
  }

  const profilePicUrl = `https://unavatar.io/x/${payload.handle}`;
  const exists = await avatarExists(payload.handle);
  const finalProfilePicUrl = exists ? profilePicUrl : 'https://example.com/default-avatar.png';

  const treeData: CreateTreeDocument = {
    position_x: payload.position_x,
    position_y: payload.position_y,
    handle: payload.handle,
    profilePicUrl: finalProfilePicUrl,
    description: payload.description,
    link: payload.link,
    size: payload.size,
    type: payload.type,
    clicks: 0,
    category: payload.category,
    userAddress: payload.userAddress
  };

  const { insertedId } = await TREES.insertOne(treeData as any); // Type assertion needed due to MongoDB's typing

  // update user tree array and set handle
  await USERS.updateOne(
    { userAddress: payload.userAddress },
    { 
      $addToSet: { trees: insertedId },
      $set: { handle: payload.handle }
    }
  );
  const createdTree = await TREES.findOne({ _id: insertedId });
  console.log("created tree",createdTree)
return res.status(200).json(createdTree);
});

app.get("/getUserTrees", async (req: Request, res: Response): Promise<any> => {
  try {
    const { userAddress } = req.query;

    if (!userAddress) {
      return res.status(400).json({ error: "Missing userAddress" });
    }

    const user = await USERS.findOne({ userAddress }) as UserDocument | null;

    if (!user || !user.trees || user.trees.length === 0) {
      return res.status(200).json([]);
    }

    const trees = await TREES.find({ _id: { $in: user.trees } }).toArray();
    console.log("trees", trees);
    return res.status(200).json(trees);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getAllTrees", async (req: Request, res: Response): Promise<any> => {
  try {
    const trees = await TREES.find({}).toArray();
    return res.status(200).json(trees);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getTreesByCategory", async (req: Request, res: Response): Promise<any> => {
  try {
    const { category } = req.query;

    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: "Missing or invalid category parameter" });
    }

    const trees = await TREES.find({ category: category as TreeCategory }).toArray();
    return res.status(200).json(trees);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getCustomCategories", async (req: Request, res: Response): Promise<any> => {
  try {
    const categories = await CUSTOM_CATEGORIES.find({}).toArray();
    return res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/createCustomCategory", async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, color, createdBy } = req.body;

    if (!title || !description || !color || !createdBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newCategory = {
      _id: new ObjectId(),
      title,
      description,
      color,
      createdBy,
      createdAt: new Date()
    };

    const result = await CUSTOM_CATEGORIES.insertOne(newCategory);
    
    return res.status(201).json({
      id: result.insertedId.toString(),
      ...newCategory
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/tree/:treeId/click", async (req: Request, res: Response) : Promise<any>=> {
  const { treeId } = req.params;

  if (!ObjectId.isValid(treeId)) {
    return res.status(400).json({ error: "Invalid treeId" });
  }

  try {
    const result = await TREES.findOneAndUpdate(
  { _id: new ObjectId(treeId) },
  { $inc: { clicks: 1 } },
  { returnDocument: "after" }
);

    console.log("result",result)
    res.json({ clicks: result?.clicks || 0 });

if (!ObjectId.isValid(treeId)) {
  return res.status(400).json({ error: "Invalid treeId" });
}
  //   if (!tree) {
  //     return res.status(404).json({ error: "Tree not found" });
  //   }


  } catch (error) {
    console.error("Error updating tree clicks:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running`);
});