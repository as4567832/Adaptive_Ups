require("dotenv").config();

const app = require("./app");
const { connectDB, closeDB } = require("./config/db");

const PORT = process.env.PORT || 3000;

connectDB();

process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});