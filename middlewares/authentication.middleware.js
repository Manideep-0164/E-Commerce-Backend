const jwt = require("jsonwebtoken");
require("dotenv").config();

const authentication = (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Please provide a token." });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err?.name === "TokenExpiredError")
          return res
            .status(401)
            .json({ message: "Session expired. Please login again." });

        console.error("JWT verification error:", err.message);

        return res.status(500).json({
          message: "Something went wrong, Please try again later.",
        });
      }

      req.role = decoded.userRole;
      req.user = decoded.userId;

      next();
    });
  } catch (error) {
    console.error("Authentication error:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

module.exports = {
  authentication,
};
