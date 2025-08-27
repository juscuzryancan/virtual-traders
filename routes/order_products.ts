import express from "express";
import { requireUser } from "./utils.js";
import {
  getOrderById,
  getUserById,
  updateOrderProduct,
  getOrderProductById,
  destroyOrderProduct,
} from "../db/utils.js";

const orderProductsRouter = express.Router();

orderProductsRouter.patch(
  "/:orderProductId",
  async (req: any, res, next: any) => {
    const { orderProductId } = req.params;
    const { price, quantity } = req.body;

    try {
      const orderProduct = await getOrderProductById(orderProductId);
      const order: any = await getOrderById(orderProduct.orderId);

      if (req.user.id === order.userId) {
        const updatedOrderProducts = await updateOrderProduct({
          id: orderProductId,
          price,
          quantity,
        });
        res.send(updatedOrderProducts);
      } else {
        res.status(403).send({
          message:
            "Logged in user should be the owner of the updated order_product.",
        });
      }
    } catch (error) {
      next(error);
    }
  },
);

orderProductsRouter.delete(
  "/:orderProductId",
  requireUser,
  async (req: any, res: any, next: any) => {
    const { orderProductId } = req.params;
    const id = req.params.orderProductId;

    try {
      const orderProduct = await getOrderProductById(orderProductId);
      const order: any = await getOrderById(orderProduct.orderId);

      if (req.user.id === order.userId) {
        const deletedOrderProduct = await destroyOrderProduct(id);
        res.send(deletedOrderProduct);
      } else {
        next({
          message:
            "Logged in user should be the owner of the deleted order_product.",
        });
      }
    } catch (error) {
      next(error);
    }
  },
);

export default orderProductsRouter;
