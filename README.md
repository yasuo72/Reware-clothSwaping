# ReWear – Community Clothing Exchange

## 👥 Team - 2088
- **Team Leader – Rohit Singh**  
 - **email - rs965198@gmail.**
 - **video LINK - https://drive.google.com/file/d/1hHrSNpMWRfpZWrIoCO7ptpKyDOUOfwQp/view?usp=drive_link**

A full-stack web application that makes it effortless for communities to swap pre-loved clothes and keep them in circulation. Users can list garments they no longer need, browse items posted by neighbours, and arrange quick swaps — reducing textile waste and promoting sustainable fashion.

---

## 📝 Problem Statement
**3rd Rewear – Cloth Swapping** (Odoo Hackathon 2025)

> Build a platform that encourages people to exchange clothes within their locality, minimising environmental impact and fostering community engagement.

---

## 🚀 Features
- User authentication & JWT-based sessions
- Add, edit & delete clothing items with Cloudinary image uploads
- Search & filter catalogue by size, category, condition, and distance
- One-click swap requests, acceptance & tracking workflow
- Admin dashboard to moderate listings and manage users
- Responsive, mobile-first UI built with React + Tailwind CSS

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Radix UI |
| **Backend**  | Node.js, Express 4, MongoDB & Mongoose |
| **Auth**     | JSON Web Tokens, bcryptjs |
| **Storage**  | Cloudinary (image uploads) |
| **Dev Tools**| Nodemon, ESLint, Prettier |

---

## 📦 Repository Structure
```
backend/
├─ rewear-backend/      # Express API
└─ frontend1/ClothSwap/ # React client
```

---

## ⚙️ Setup & Running Locally
1. **Clone the repo**  
   ```bash
   git clone <repo_url>
   cd backend
   ```
2. **Install dependencies**  
   ```bash
   # Backend
   cd rewear-backend
   npm install

   # Frontend
   cd ../frontend1/ClothSwap
   npm install
   ```
3. **Environment variables**  
   Copy `.env.example` to `.env` in `rewear-backend/` and fill in:
   ```env
   PORT=5000
   MONGO_URI=<your_mongodb_uri>
   CLOUDINARY_CLOUD_NAME=<name>
   CLOUDINARY_API_KEY=<key>
   CLOUDINARY_API_SECRET=<secret>
   JWT_SECRET=<very_secret_value>
   ```
4. **Start the servers**  
   ```bash
   # In one terminal (API)
   cd rewear-backend
   npm run dev

   # In another terminal (Frontend)
   cd frontend1/ClothSwap
   npm run dev
   ```
5. Visit `http://localhost:5173` in your browser and have fun swapping! 🛍️

---

## ✉️ API Overview
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/auth/register | Register new user |
| POST   | /api/auth/login    | Login & receive JWT |
| GET    | /api/items         | List all items |
| POST   | /api/items         | Create new item |
| PUT    | /api/items/:id     | Update item |
| DELETE | /api/items/:id     | Delete item |
| POST   | /api/swaps         | Initiate swap |
| PUT    | /api/swaps/:id     | Update swap status |

(For complete request/response schemas, see the Postman collection in `docs/`.)

---



## 📸 UI Screenshots

| | |
|---|---|
| ![Admin Dashboard](frontend1/ClothSwap/assets/Admin%20-%20Copy.png) | ![Landing Page](frontend1/ClothSwap/assets/Landing%20Page%20-%20Copy%20-%20Copy.jpg) |
| ![Listings](frontend1/ClothSwap/assets/Listings%20-%20Copy%20-%20Copy.png) | ![Login Page 1](frontend1/ClothSwap/assets/Login%20Page%20-%20Copy%20%282%29.png) |
| ![Login Page 2](frontend1/ClothSwap/assets/Login%20Page%20-%20Copy%20-%20Copy.png) | ![Orders](frontend1/ClothSwap/assets/Orders%20-%20Copy%20-%20Copy.png) |
| ![Personal Info](frontend1/ClothSwap/assets/Personal%20info%20-%20Copy%20-%20Copy.jpg) | ![Product Detail](frontend1/ClothSwap/assets/Product%20detail%20Page%20-%20Copy%20-%20Copy.png) |
| ![Products List](frontend1/ClothSwap/assets/Products%20List%20page%20-%20Copy%20-%20Copy.png) |  |

---

## 📄 License
Distributed under the MIT License – see `LICENSE` for details.
