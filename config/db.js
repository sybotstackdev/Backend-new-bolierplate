import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const conString = `postgresql://${process.env.DATABASE_USERNAME}:${encodeURIComponent(
  process.env.DATABASE_PASSWORD
)}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;

// export const conString = `${process.env.POSTGRESQL_URI}`

// Create a pool using the connection string
export const pool = new Pool({
  connectionString: conString,
  ssl: {
    rejectUnauthorized: false, // Set to false if using self-signed or NeonDB
  },
});

const keepAlive = () => {
  setInterval(async () => {
    try {
      await pool.query('SELECT 1');
      console.log('🟢 Neon DB keep-alive ping sent');
    } catch (err) {
      console.error('🔴 Neon DB keep-alive failed:', err.message);
    }
  }, 4 * 60 * 1000); // every 4 minutes (Neon idles after 5 min)
};

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    client.release();
    keepAlive(); // Start ping loop
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

export const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.warn("Initial DB query failed, retrying:", err.message);
    await new Promise((res) => setTimeout(res, 1000)); // wait 1 sec
    return pool.query(text, params); // one retry
  }
};


export default connectDB;
