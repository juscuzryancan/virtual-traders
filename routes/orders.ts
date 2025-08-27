import express from "express";
import { requireUser, isAdmin } from "./utils.js";
import { addProductToOrder } from "../db/order_products.js";
import {
  getAllOrders,
  getCartByUser,
  createOrder,
  updateOrder,
  cancelOrder,
  completeOrder,
  getOrderById,
  getOrdersByUser,
} from "../db/utils.js";

const ordersRouter = express.Router();

ordersRouter.get("/", [requireUser, isAdmin], async (req, res, next) => {
  try {
    const orders = await getAllOrders();
    res.send(orders);
  } catch (error) {
    next(error);
  }
});

ordersRouter.get("/cart", async (req: any, res, next: any) => {
  try {
    let cart;
    if (!req.user) {
      // create an empty cart here with no user id
      cart = await createOrder({ status: "created", userId: null });
      cart.products = [];
      res.send(cart);
      return;
    }

    // Try to grab the cart
    cart = await getCartByUser(req.user);

    // If theres no cart then create an empty cart
    if (!cart) {
      cart = await createOrder({ status: "created", userId: req.user.id });
      cart.products = [];
    }

    res.send(cart);
    return;
  } catch (error) {
    next(error);
  }
});

ordersRouter.post("/", requireUser, async (req: any, res, next) => {
  try {
    const order = await createOrder({ status: "created", userId: req.user.id });
    res.send(order);
  } catch (error) {
    next(error);
  }
});

ordersRouter.patch(
  "/:orderId",
  requireUser,
  async (req: any, res, next: any) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const { userId } = req.user.id;

    try {
      const order: any = await updateOrder({ id: "", orderId, status, userId });
      res.send(order);
    } catch (error) {
      next(error);
    }
  },
);

ordersRouter.delete("/:orderId", requireUser, async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await cancelOrder(orderId);
    res.send(order);
  } catch (error) {
    next(error);
  }
});

ordersRouter.post("/:orderId/products", async (req, res, next) => {
  const { orderId } = req.params;
  const { productId, price, quantity } = req.body;

  try {
    const orderProduct = await addProductToOrder({
      orderId,
      productId,
      price,
      quantity,
    });
    res.send(orderProduct);
  } catch (error) {
    next(error);
  }
});

ordersRouter.patch(
  "/:orderId/complete",
  requireUser,
  async (req: any, res, next: any) => {
    const { orderId } = req.params;
    try {
      await completeOrder({ id: orderId });
      await createOrder({ status: "created", userId: req.user.id });
      const cart = await getCartByUser({ id: req.user.id });
      const completedOrder = await getOrderById(orderId);
      res.send({ completedOrder, cart });
    } catch (error) {
      next(error);
    }
  },
);

ordersRouter.get(
  "/users/:username",
  requireUser,
  async (req: any, res, next) => {
    const { username }: any = req.params;
    try {
      if (req.user.username !== username) {
        res.status(403).send({
          message: "Please request with the username tied to your token",
        });
        return;
      }

      const orders = await getOrdersByUser({ id: req.user.id });
      res.send(orders);
    } catch (error) {
      next(error);
    }
  },
);

export default ordersRouter;
