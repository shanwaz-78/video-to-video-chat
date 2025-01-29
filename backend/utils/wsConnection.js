import { Server } from "socket.io";
import createConnection from "../config/dbConnection.js";

export async function openSocketConnection(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  const pool = await createConnection();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join", async ({ username, interests }) => {
      try {
        await pool.query(
          "UPDATE users SET socket_id = $1, is_online = $2 WHERE username = $3",
          [socket.id, true, username]
        );

        const { rows } = await pool.query(
          "SELECT * FROM users WHERE interests && $1::text[] AND socket_id != $2 LIMIT 1",
          [interests, socket.id]
        );

        if (rows.length > 0) {
          const matchedUser = rows[0];
          console.log("Matched User:", matchedUser);

          socket.emit("matched", matchedUser);
          console.log(`Sending 'matched' to ${socket.id}`);

          if (matchedUser.socket_id) {
            io.to(matchedUser.socket_id).emit("matched", {
              username,
              socketId: socket.id,
            });
            console.log(`Sending 'matched' to ${matchedUser.socket_id}`);
          } else {
            console.log("No socket_id for matched user, can't send signal.");
          }
        } else {
          console.log(`No match found for ${username}`);
        }
      } catch (error) {
        console.error(`Error handling join event: ${error.message}`);
      }
    });

    socket.on("signal", ({ to, signalData }) => {
      console.log(`Sending signal from ${socket.id} to ${to}`);

      if (to) {
        io.to(to).emit("signal", { signalData, from: socket.id });
        console.log(`Signal sent from ${socket.id} to ${to}`);
      } else {
        console.error(`No recipient found for signal from ${socket.id}`);
      }
    });

    socket.on("disconnect", async () => {
      try {
        console.log(`User disconnected: ${socket.id}`);
        await pool.query(
          "UPDATE users SET is_online = $1 WHERE socket_id = $2",
          [false, socket.id]
        );
      } catch (error) {
        console.error(`Error handling disconnect: ${error.message}`);
      }
    });
  });

  return io;
}
