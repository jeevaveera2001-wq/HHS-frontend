import {
  io,
} from "socket.io-client";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (
    import.meta.env.PROD
      ? "https://hhs-backend-cwzx.onrender.com/api"
      : "http://localhost:5000/api"
  )
).replace(/\/+$/, "");

const SOCKET_URL =
  API_URL.replace(
    /\/api$/,
    ""
  );

let propertySocket = null;

/* =====================================
   Create/reuse Socket.IO connection
===================================== */

export const getPropertySocket =
  () => {
    if (propertySocket) {
      return propertySocket;
    }

    propertySocket = io(
      SOCKET_URL,
      {
        autoConnect: true,

        transports: [
          "websocket",
          "polling",
        ],

        withCredentials: true,

        reconnection: true,

        reconnectionAttempts:
          Infinity,

        reconnectionDelay: 1000,

        reconnectionDelayMax:
          10000,

        timeout: 20000,
      }
    );

    propertySocket.on(
      "connect",
      () => {
        console.log(
          "HHS realtime connected:",
          propertySocket.id
        );
      }
    );

    propertySocket.on(
      "disconnect",
      (reason) => {
        console.warn(
          "HHS realtime disconnected:",
          reason
        );
      }
    );

    propertySocket.on(
      "connect_error",
      (error) => {
        console.warn(
          "HHS realtime connection error:",
          error.message
        );
      }
    );

    return propertySocket;
  };

export const connectPropertySocket =
  () => {
    const socket =
      getPropertySocket();

    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  };

export const disconnectPropertySocket =
  () => {
    if (!propertySocket) {
      return;
    }

    propertySocket.disconnect();
    propertySocket = null;
  };