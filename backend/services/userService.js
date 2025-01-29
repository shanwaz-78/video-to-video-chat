import createConnection from "../config/dbConnection.js";

const registerService = async (data, res) => {
  const { username, interests } = data;
  const pool = await createConnection();
  try {
    const query =
      "INSERT INTO users (username, interests, is_online) VALUES ($1, $2, $3) RETURNING *";
    const result = await pool.query(query, [username, interests, true]);
    res
      .status(201)
      .json({ message: `Registered Successful.`, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { registerService };
