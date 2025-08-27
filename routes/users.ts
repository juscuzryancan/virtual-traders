import express from "express";
import jwt from "jsonwebtoken";
import {
  getUserByEmail,
  createUser,
  getUserByUsername,
  getUser,
  getOrdersByUser,
  getAllUsers,
  updateUser,
} from "../db/utils.js";
import { requireUser, isAdmin } from "./utils.js";

const JWT_SECRET = process.env.JWT_SECRET as string;
const usersRouter = express.Router();

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, firstName, lastName, email, isAdmin, imageURL } =
    req.body;
  if (password.length < 8) {
    res.status(500).send({ message: "Password too short!" });
    return;
  }

  try {
    let user = await getUserByUsername(username);
    if (user) {
      res
        .status(500)
        .send({ message: "A user by that username already exists!" });
      return;
    }

    user = await getUserByEmail(email);
    if (user) {
      res
        .status(500)
        .send({ message: "This email is already associated with an account" });
      return;
    }

    user = await createUser({
      username,
      password,
      firstName,
      lastName,
      email,
      // isAdmin: false,
      // imageURL: "",
    });
    const token = jwt.sign(user, JWT_SECRET);
    res.send({ message: "thanks for signing up!", user, token });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await getUser({ username, password });

    if (user) {
      const token = jwt.sign(user, JWT_SECRET);

      res.send({
        message: "you're logged in!",
        user,
        token,
      });
    } else {
      res.status(500).send({
        status: 500,
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect!",
      });
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", requireUser, async (req: any, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId/orders", requireUser, async (req: any, res, next) => {
  const { userId } = req.params;
  try {
    const orders = await getOrdersByUser(req.user);
    res.send(orders);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", isAdmin, async (req, res, next) => {
  try {
    const users = await getAllUsers();

    res.send(users);
  } catch (error) {
    const { name, message }: any = error;
    next({ name, message });
  }
});

usersRouter.patch("/:userId", isAdmin, async (req, res, next) => {
  try {
    const {
      // Set a default fallback value if params is undefined.
      params: { userId } = {},
      body: user,
    } = req;

    if (user.id || user.password || user.imageURL || user.isAdmin) {
      return res.sendStatus(403);
    }

    await updateUser(userId, user);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
