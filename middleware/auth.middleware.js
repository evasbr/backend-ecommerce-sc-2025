const jwt = require("jsonwebtoken");

function authorization(roles = []) {
  return function (req, res, next) {
    try {
      let token = req.signedCookies?.token;
      const secret = process.env.JWT_SECRET;

      if (!token) {
        throw new Error("No token provided", 401);
      }

      if (!secret) {
        throw new Error("Missing JWT secret");
      }
      const decoded = jwt.verify(token, secret);

      if (!decoded || typeof decoded !== "object" || !("role" in decoded)) {
        throw new ClientError("Invalid token payload", 403);
      }

      const role = decoded.role;

      if (!roles.includes(role)) {
        throw new Error("You are not authorized to access this resource");
      }

      req.user = { role, id_user: decoded.user_id };

      next();
    } catch (error) {
      console.error("Authorization error:", error.message);
      res.status(401).json({
        success: false,
        message: "Authorization failed",
        error: error.message,
      });
    }
  };
}

module.exports = authorization;
