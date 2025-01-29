import pkg from "pg";
const { Pool } = pkg;

async function createConnection() {
  const poolConfig = {
    user: process.env.DB_USER,
    host: process.env.HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PSWD,
    port: process.env.DB_PORT,
  };

  let pool;

  try {
    pool = new Pool(poolConfig);

    const client = await pool.connect();
    console.log("Database connection successful");
    client.release(); // release back the client to the pool.

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client:", err.message);
    });

    return pool;
  } catch (error) {
    console.error("Failed to initialize the connection pool:", error.message);
    process.exit(1);
  }
}

export default createConnection;
