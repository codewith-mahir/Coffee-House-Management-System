const { Router } = require('express');
const mongoose = require('mongoose');

const router = Router();

router.get('/', (_req, res) => {
  const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const stateLabel =
    state === 1 ? 'connected' :
    state === 2 ? 'connecting' :
    state === 3 ? 'disconnecting' : 'disconnected';

  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    db: { state, stateLabel },
    skipDb: process.env.SKIP_DB === 'true',
  });
});

module.exports = router;
