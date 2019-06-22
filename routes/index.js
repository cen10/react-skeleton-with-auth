const express = require("express");
const userRouter = require("./api/users");

const router = express.Router();

router.get("/", function(req, res) {
  res.status(200);
});

router.use("/users", userRouter);

module.exports = router;
