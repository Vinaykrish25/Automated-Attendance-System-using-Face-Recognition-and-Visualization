# 🎓 Smart Attendance System – Backend (Node.js + Express + MongoDB)

This is the **backend** of the Smart Attendance System project.  
It provides APIs for **authentication, attendance management, and user handling**.
**Main Repository: (Full project here 👉):** [Automated Attendance System using Face Recognition and Visualization](https://github.com/Vinaykrish25/Automated-Attendance-System-using-Face-Recognition-and-Visualization.git)

🔗 **Live Demo (Frontend):** [See demo](https://automated-attendance-system-fronten.vercel.app/)

---

## 🌐 Backend Setup (Node.js + Express + MongoDB)

### 1. 📁 Install dependencies

```bash
cd backend
npm install
npm install express mongoose bcryptjs body-parser cookie-parser cors dotenv jsonwebtoken nodemailer nodemon
```

### 2. ⚙️ Configure Environment
Create a .env file in the backend folder with the following variables:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JSON_TOKEN=your_jwt_secret
```

### 3. 🚀 Start Server

```bash
node server.js
```
Or, for auto-reload during development:
```bash
npx nodemon server.js
```

### ☁️ MongoDB Data Structure:
### 📄 User Collection:
 
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed",
  "role": "student",
  "rollNumber": 101
}
```

### 📄 Attendance Collection
```json
{
  "rollNumber": 101,
  "name": "John Doe",
  "date": "2024-06-01",
  "1st Period": "Present",
  "2nd Period": "Absent",
  "Break-time": "Break-time",
  "3rd Period": "Not yet marked",
  "4th Period": "Absent",
  "Lunch-time": "Lunch-time",
  "5th Period": "Present",
  "6th Period": "Not yet marked",
  "7th Period": "Not yet marked"
}
```

### ✅ Project Structure (Backend Only)

```
backend
├── models/
├── config/
├── routes/
├── controllers/
├── middlewares/
├── server.js
├── .gitignore (add node_modules and .env)
└── .env
```

### 🧠 Contributions

 - This backend integrates Node.js, Express.js, and MongoDB to handle:
 - Authentication (JWT-based)
 - Role management (Admin, Student)
 - Attendance records storage and retrieval
 - Secure password storage with bcrypt