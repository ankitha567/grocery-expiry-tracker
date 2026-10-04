# Grocery Tracker 🥦

**Smart expiry management & food waste reducer** — built for the **AI for Everyday Life** hackathon problem statement.

Track what's in your kitchen, get pinged before food spoils, cook it up with AI-picked recipes, and watch your household's food waste (and money) savings add up — solo or shared with family.

---

## 🚀 Live Demo

- **Live App:** Not deployed — see Demo Video below for a full walkthrough, or run locally using the setup instructions.
- **Demo Video:** _[https://drive.google.com/file/d/1EUZbJZyjOp3Tl2e0FwgVZJQAWBo7DAv9/view?usp=sharing]_
- **GitHub Repo:** https://github.com/ankithas567/grocery-expiry-tracker

---

## 🧠 The Problem

Households routinely waste food and money simply because they forget what's in the fridge and when it expires. Most food waste isn't due to lack of care — it's a lack of visibility and timely reminders.

## 💡 Our Solution

Grocery Tracker gives users a simple, AI-assisted way to log groceries (by hand, barcode scan, or voice), see at a glance what's expiring, get recipe ideas to use things up in time, and track their real-world impact on food waste — turning a daily chore into a small, rewarding habit.

---

## ✨ Features

### Core Tracking
- **Add items** manually, by **scanning a barcode** (photo upload or live camera), or by **voice command** ("Add milk category dairy expiring in 5 days")
- **Auto product lookup** via the Open Food Facts database — scanning a barcode fills in the name and category automatically
- **Expiry auto-suggestion** — don't know the expiry date? The app estimates one based on the item's category (e.g., Dairy → 7 days, Bakery → 5 days)
- **Color-coded expiry badges** — green (fresh), amber (expiring soon), red (expired) — with filter tabs to view All / Expiring Soon / Expired

### AI & Smart Suggestions
- **AI-powered recipe suggestions** (via Spoonacular API) generated from whatever's about to expire in your inventory
- **Expiry Roulette** — "What should I eat today?" spins a random soon-to-expire item and pairs it with a recipe
- **Smart Shopping List** — auto-generated "buy again" list built from your past Used/Wasted history, ranked by purchase frequency

### Impact & Motivation
- **Food Waste Saved counter** — tracks kilograms of food saved from the bin, plus an estimated CO₂ emissions avoided
- **Streak system** — counts consecutive days without wasting food, resetting when an item is marked "Wasted"
- **In-app notifications** — a banner flags items expiring within 3 days the moment you open the app

### Collaboration & UX
- **Household sharing** — generate or join a 6-digit household code so family members see and manage the same grocery list
- **Multi-page app** (React Router) — Dashboard, Inventory, Shopping List, Recipes
- **Login / Signup flow**
- **Dark mode toggle**
- **Friendly mascot ("Fridgy")** offering contextual tips on the Dashboard
- Polished, responsive UI with pastel gradients, glassmorphism cards, background illustrations, and hover animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS |
| Backend | Java, Spring Boot (REST API) |
| Database | MongoDB Atlas |
| Barcode Scanning | html5-qrcode |
| Recipe Data | Spoonacular API |
| Product Lookup | Open Food Facts API |
| Voice Input | Web Speech API (browser-native) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📂 Project Structure

```
grocery-expiry-tracker/
├── backend/
│   └── demo/
│       ├── src/main/java/com/example/demo/
│       │   ├── GroceryItem.java
│       │   ├── GroceryItemRepository.java
│       │   ├── GroceryItemService.java
│       │   ├── GroceryItemController.java
│       │   ├── RecipeController.java
│       │   └── ProductController.java
│       └── src/main/resources/
│           └── application.properties
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Mascot.jsx
│   │   │   ├── ItemCard.jsx
│   │   │   ├── BarcodeScanner.jsx
│   │   │   ├── HouseholdBanner.jsx
│   │   │   ├── ExpiryRoulette.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── GroceryContext.jsx
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── ShoppingList.jsx
│   │   │   ├── Recipes.jsx
│   │   │   └── Login.jsx
│   │   ├── config.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
└── README.md
```

---

## ⚙️ Getting Started (Local Setup)

### Prerequisites
- Java 17+
- Node.js 18+
- A MongoDB Atlas cluster (free tier works)
- A free [Spoonacular API key](https://spoonacular.com/food-api)

### 1. Clone the repo
```bash
git clone https://github.com/ankithas567/grocery-expiry-tracker.git
cd grocery-expiry-tracker
```

### 2. Backend setup
```bash
cd backend/demo
```
Create `src/main/resources/application.properties`:
```properties
spring.application.name=demo
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@<your-cluster>.mongodb.net/groceryDB?retryWrites=true&w=majority
spoonacular.api.key=<your-spoonacular-api-key>
server.port=8080
```
Run the backend:
```bash
./mvnw spring-boot:run
```
The API will be live at `http://localhost:8080`.

### 3. Frontend setup
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/` for local development (optional — defaults to localhost if omitted):
```
VITE_API_URL=http://localhost:8080
```
Run the frontend:
```bash
npm run dev
```
The app will be live at `http://localhost:5173`.

---

## 🔌 API Endpoints (Backend)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/items?householdId=` | Get all active items for a household |
| POST | `/api/items` | Add a new item |
| PUT | `/api/items/{id}` | Update an item |
| DELETE | `/api/items/{id}` | Delete an item |
| PATCH | `/api/items/{id}/status?status=` | Mark item as USED / WASTED |
| GET | `/api/items/expiring?householdId=&days=` | Get items expiring within N days |
| GET | `/api/items/stats?householdId=` | Get food waste impact stats |
| GET | `/api/items/shopping-list?householdId=` | Get auto-generated shopping list |
| GET | `/api/recipes/suggestions?householdId=&days=` | Get recipe suggestions from expiring items |
| GET | `/api/products/{barcode}` | Look up a product by barcode (Open Food Facts) |

---

## 🌱 Impact

By combining simple expiry tracking with AI-driven recipe suggestions and real-time waste analytics, Grocery Tracker helps households:
- Reduce food thrown away (and the money that goes with it)
- Discover recipes for ingredients they already own
- Build sustainable habits through visible, motivating feedback (streaks, kg saved, CO₂ avoided)
- Coordinate grocery management across a household with zero extra setup

---

## 🔮 Future Improvements

- Push notifications (not just in-app banners)
- Multi-language voice input support
- Barcode-based nutrition insights
- Full production-grade authentication
- Native mobile app

---

## 👤 Team

- **Ankitha** — Full-stack development (backend, frontend, deployment)

---

## 📄 License

MIT
