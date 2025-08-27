function requireUser(req, res, next) {
  if (!req.user) {
    res.status(401).send({
      name: "UnauthenticatedUserError",
      message: "You must be logged in to perform this action!",
    });
  }

  next();
}

function isAdmin(req, res, next) {
  if (!req.user.isAdmin) {
    res.status(403).send({
      name: "UnauthorizedUserError",
      message: "You must be an admin to perform this action",
    });
  }

  next();
}

export { requireUser, isAdmin };
