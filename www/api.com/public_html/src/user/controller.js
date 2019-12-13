const router = require("express").Router();
const userService = require("./service");

router.get("/", async (req, res, next) => {
  try {
    const users = await userService.getAll();

    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    console.log(req.body);
    const { name } = req.body;
    const users = await userService.createUser(name);

    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
