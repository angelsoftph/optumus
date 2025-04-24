import Pusher from "pusher-js";

export const pusherClient = new Pusher("YOUR_PUSHER_KEY", {
  cluster: "YOUR_CLUSTER",
  forceTLS: true,
});
