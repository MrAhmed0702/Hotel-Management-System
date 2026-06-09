export const authorize = (...roles) => {
  const allowedRoles = new Set(roles.flat(Infinity));

  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: role not found",
      });
    }

    if (!allowedRoles.has(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};