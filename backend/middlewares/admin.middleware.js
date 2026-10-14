const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden - Administrator access required'
    });
  }

  return next();
};

module.exports = { requireAdmin };
