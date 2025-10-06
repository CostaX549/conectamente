// lib/pusher.js
import PusherServer from "pusher";
import PusherClient from "pusher-js";

// 🧠 Servidor (Next.js API ou Server Action)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// 🌐 Cliente (navegador)
export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
});
