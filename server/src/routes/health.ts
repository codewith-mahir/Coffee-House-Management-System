import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (_req, res) => {
  const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    db: stateMap[state] ?? 'unknown',
    skipDb: process.env.SKIP_DB === 'true'
  });
});

export default router;
