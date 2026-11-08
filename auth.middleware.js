const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : header;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // routes use this to scope data to the logged-in user
    next();
  } catch (error) {
    res.status(401).send({ msg: "Login first" });
  }
};

module.exports = { auth };
