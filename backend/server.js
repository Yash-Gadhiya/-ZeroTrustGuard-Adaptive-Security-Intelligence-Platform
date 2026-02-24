const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/database");
const User = require("./models/User");
const ActivityLog = require("./models/ActivityLog");
const Alert = require("./models/Alert");   // ✅ ADD THIS

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

app.get("/", (req, res) => {
  res.send("ZeroTrustGuard Backend Running...");
});

const PORT = process.env.PORT || 5000;
const socRoutes = require("./routes/socRoutes");
app.use("/api/soc", socRoutes);
async function startServer() {
  try {
    await connectDB();

    await User.sync({ alter: true });
    console.log("Users table synced");

    await ActivityLog.sync({ alter: true });
    console.log("ActivityLog table synced");

    await Alert.sync({ alter: true });   // ✅ ADD THIS
    console.log("Alert table synced");

    await Alert.sync({ alter: true });
    console.log("Alert table synced");
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Startup error:", error);
  }
}

startServer();