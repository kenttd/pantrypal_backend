import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  console.log("checkUser middleware");
  // console.log(req.headers.authorization);
  // console.log(process.env.JWT_SECRET);
  try {
    jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET,
      function (err, decoded) {
        if (err) {
          console.log(err);
          res.status(401).send({ message: "Unauthorized", error: err.message });
        } else {
          req.user = decoded;
        }
      }
    );
  } catch (err) {
    res.status(401).send({ message: "Unauthorized", error: err.message });
  }

  next();
}
