function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
    return res.status(status).json({ error: message, stack: err.stack });
  } else {
    return res.status(status).json({ error: message });
  }
}

module.exports = { errorHandler };
