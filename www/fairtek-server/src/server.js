const express = require("express");
const cors = require("cors");
const userController = require("./user/controller");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/users", userController);

app.listen(port, () => console.log("Server ON " + port));
