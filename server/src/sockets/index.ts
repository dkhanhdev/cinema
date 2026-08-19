import { Server } from 'socket.io';
import { setupSeatSocket } from './seatSocket.js';

export const initSockets = (io: Server) => {
  setupSeatSocket(io);
};
