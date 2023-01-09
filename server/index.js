// Development = Node.js server + React server

// MEN
// cd server
// npm init

// E -Express (Which allows our server has a easier looking syntax)
// npm i express
// npm i nodemon --save-dev (nodemon will restart the server and reflect the changes)
// add dev script in the package.json
// how to run nodemon: npx nodemon

// npm i cors -> cross origin resources sharing
// npm i mongoose -> mongoDB

// createa "models" folder -> for mongoDB

// Front-end install react-router-dom
// Back-end install jsonwebtoken -> sign jwt token, retrive them and work with them
// token is encrypted base64 encoded text, json payload

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json()); // middleware?

mongoose.connect("mongodb://localhost:27017/mern-stack");

app.post("/api/register", async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    res.json({ status: "OK" });
  } catch (err) {
    res.json({ status: "error", error: "Duplicate email" });
  }
});

app.post("/api/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      "secret123"
    );
    console.log(token);
    res.cookie("x-access-token", token);
    return res.json({ status: "ok", user: token });
  } else {
    return res.json({ status: "error", user: false });
  }
});

app.get("/api/quote", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "secret123");
    const email = decoded.email;
    const user = await User.findOne({ email: email });

    return res.json({ status: "ok", quote: user.quote });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "get invalid token" });
  }
});

app.post("/api/quote", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "secret123");
    const email = decoded.email;
    await User.updateOne({ email: email }, { $set: { quote: req.body.quote } });

    return res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: " post invalid token" });
  }
});

app.listen(1337, () => {
  console.log("Server started on 1337");
});
