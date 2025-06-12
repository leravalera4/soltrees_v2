# soltrees

# SolTrees Project

A full-stack web application that combines blockchain technology with 3D visualization, built using modern web technologies.

## 🌳 Overview

SolTrees is a full-stack application that integrates Solana blockchain technology with interactive 3D visualization. The project consists of a React-based frontend with Three.js for 3D graphics and a Node.js backend with Express.

## 🏗️ Project Structure

```
soltrees/
├── soltrees-fe/     # Frontend application
│   ├── src/         # React source code
│   ├── public/      # Static assets
│   └── ...          # Frontend configuration files
│
└── soltrees-be/     # Backend application
    ├── src/         # Node.js source code
    └── ...          # Backend configuration files
```

## 🛠️ Technology Stack

### Frontend (`soltrees-fe/`)
- React 18 with TypeScript
- Three.js and React Three Fiber for 3D graphics
- Tailwind CSS for styling
- Vite as build tool
- Solana Web3.js for blockchain integration
- Supabase for database

### Backend (`soltrees-be/`)
- Node.js with Express
- TypeScript
- MongoDB for database
- WebSocket support
- Solana Web3.js integration
- CORS enabled

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x
- npm or yarn
- MongoDB
- Solana CLI tools (optional)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd soltrees
```

2. Install frontend dependencies:
```bash
cd soltrees-fe
npm install
```

3. Install backend dependencies:
```bash
cd ../soltrees-be
npm install
```

### Environment Setup

1. Frontend environment variables:
Create a `.env` file in `soltrees-fe/` with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

2. Backend environment variables:
Create a `.env` file in `soltrees-be/` with:
```
PORT=3000
MONGODB_URI=your_mongodb_uri
SOLANA_RPC_URL=your_solana_rpc_url
```

## 🏃‍♂️ Development

### Running Frontend
```bash
cd soltrees-fe
npm run dev
```
Frontend will be available at `http://localhost:5173`

### Running Backend
```bash
cd soltrees-be
npm run dev
```
Backend will be available at `http://localhost:3000`

## 🏗️ Building for Production

### Frontend
```bash
cd soltrees-fe
npm run build
```

### Backend
```bash
cd soltrees-be
npm run build
npm start
```

## 📚 API Documentation

The backend API documentation is available in the `soltrees-be/README.md` file.

## 🔒 Security

- Environment variables are used for sensitive data
- CORS is properly configured
- Input validation is implemented
- Error boundaries are in place

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and all rights are reserved.

## 👥 Authors

- [@leravalera4](https://github.com/leravalera4) — Frontend, Idea, Dev
- [@joeknowscode](https://github.com/joeknowscode) — Backend, Idea, Dev

## 🙏 Acknowledgments

- Solana Foundation
- Three.js community
- React team
