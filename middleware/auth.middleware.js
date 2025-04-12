const jwt = require("jsonwebtoken");

function authorization(roles) {
  return function (req, res, next) {
    try {
      let token = "";
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        token = req.headers.authorization.split(" ")[1];
        if (token !== null && token !== undefined && token !== "") {
          user = jwt.verify(token, process.env.JWT_SECRET);
          req.body.user = user;
        }
      }

      if (!roles.includes(user.role)) {
        throw new Error("You are not authorized with this token");
      }

      next();
    } catch (error) {
      console.log(error);
      res
        .status(401)
        .json({ message: "Authorization failed", error: error.message });
    }
  };
}

module.exports = authorization;
