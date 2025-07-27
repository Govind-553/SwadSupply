# SwadSupply 🍛  
**AI-Powered Raw Material Sourcing Platform for Street Food Vendors**

SwadSupply is a hackathon-ready, real-world platform that empowers India’s street food vendors by connecting them with trusted local raw material suppliers. Using AI-backed price verification and group-buying features, SwadSupply ensures fair prices, faster sourcing, and simplified vendor-supplier interaction.

---

## 🚀 Demo

🌐 Live Demo (Frontend): _[Link if hosted]_  
🔗 API Test Playground: _[Replit/Flask endpoint]_  
📽️ Walkthrough Video: _[Attach if recorded]_

---

## 📌 Problem Statement

Street vendors face daily issues sourcing raw materials:
- Fluctuating & unfair prices
- Lack of trusted suppliers
- No digital price benchmarks (like mandi prices)
- Language/digital literacy barriers
- Wasted time in procurement

---

## ✅ Solution

SwadSupply solves this with:
- AI-based real-time mandi price comparison
- Nearby trusted supplier discovery
- Group ordering to lower costs
- Voice-activated search and ordering
- Supplier dashboard for inventory & delivery

---

## 🧠 Key Features

- 🧠 **AI Price Validator:** Compares current prices with Agmarknet mandi prices  
- 📍 **Nearby Supplier Discovery:** Lists trusted vendors based on live geolocation  
- 👥 **Group Buying:** Multiple vendors in the same area can place bulk orders  
- 🗣️ **Voice Search in Hindi/English:** Use voice to search or place orders  
- 📦 **Supplier Dashboard:** Manage listings, prices, delivery, and fulfillment  
- 🔐 **Secure Auth:** Firebase-based role-based authentication for vendors & suppliers  
- 🧾 **Smart Order Suggestions:** Based on previous purchase behavior  
- 📊 **Vendor Trust Score:** Score based on delivery speed, order accuracy, and ratings

---

## 🧑‍💼 User Flow

### 👨‍🍳 Buyer (Street Food Vendor)
1. Logs in or signs up
2. Searches for raw materials (text or voice)
3. Compares prices with mandi rates
4. Selects supplier (sorted by trust score & distance)
5. Can join a group order for bulk discount
6. Confirms order & views delivery ETA
7. Rates supplier post-delivery

### 🧺 Seller (Raw Material Supplier)
1. Logs into dashboard
2. Uploads available inventory, pricing & delivery window
3. Receives new orders or group orders
4. Confirms dispatch & marks delivery done
5. Gets rated and improves trust score

---

## 🛠️ Tech Stack

| Layer       | Technology Used                                      |
|------------|------------------------------------------------------ |
| Frontend   | CSS3, JavaScript, React.js                            |
| Backend    | Firebase Realtime DB, Firebase Auth, Flask (Python)   |
| AI / APIs  | Agmarknet API (Gov. of India), Web Speech API         |
| Hosting    | Vercel / Netlify (Frontend), Firebase Hosting         |
| DevTools   | Flask, GitHub                                         |

---

## 📦 Folder Structure

swadsupply/
│
├── client/ # React Frontend
│ ├── public/
│ └── src/
│ ├── components/
│ └── styles/
│
├── server/ # Flask API for price comparison
│ └── app.py
│
├── firebase/ # Firebase config & structure
│ └── firebase.js
│
├── README.md
├── feature_checklist.md
└── package.json

yaml
Copy
Edit

---

## 🔐 Firebase Setup

- Enable **Authentication** (Email/Phone)
- Create two roles: `vendor`, `supplier`
- Realtime DB Structure:

```json
/vendors/{vendorId}
  - name
  - location
  - orderHistory

/suppliers/{supplierId}
  - name
  - items[]
  - deliveryTimes
  - trustScore
🧪 How to Run Locally
Clone the repo:
git clone https://github.com/yourname/swadsupply.git
Install dependencies:

cd swadsupply/client
npm install
Start frontend:

npm start
Run Flask API (Python):

cd server
python app.py
💡 Future Enhancements
Multi-language support

Payment gateway integration (UPI for COD)

Analytics for suppliers

SMS alerts for order status

🏁 Team
Govind [Team Lead, Frontend Dev]

Abhiruchi[Teammate 2 – Backend & AI]

Sahil[Teammate 3 – Firebase & UX]

Nishank[Teammate 4 – Testing & Deployment]