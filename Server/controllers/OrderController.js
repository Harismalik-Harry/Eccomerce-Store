import fs from "fs/promises";
import { getConnection } from "../config/DatabaseConnection.js";
import * as productService from "../models/productModel.js";
import * as CartService from "../models/CartModel.js";
import * as OrderService from "../models/OrderModel.js";
export const addItemIntoCart = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    connection.beginTransaction();

    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }
    const product = await productService.getProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const [user] = await connection.execute(
      "Select * from Cart where user_id=?",
      [userId]
    );
    let cartId;
    if (user.length === 0) {
      const cart = await CartService.insertIntoCart(userId);
      cartId = cart.insertId;
    } else {
      cartId = user[0].cart_id;
    }
    const productt = await connection.execute(
      "select * from cart_item where cart_id=? and product_id=?",
      [cartId, productId]
    );
    if (productt.length === 0) {
      const cartItem = await CartService.insertIntoCartItem(
        cartId,
        productId,
        1
      );
      await connection.commit();
      return res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
        cartItem,
      });
    } else {
      const [result] = await connection.execute(
        "update cart_item set quantity=quantity+1 where cart_id=? and product_id=? and user_id=?",
        [cartId, productId, userId]
      );
      await connection.commit();
      return res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
      });
    }
  } catch (error) {
    await connection.rollback();
    console.error("Error adding product to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getCartItems = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    connection.beginTransaction();
    const { userId } = req.params;
    const cartItems = await CartService.getCartItemsByUserId(userId);
    await connection.commit();
    return res.status(200).json({
      success: true,
      cartItems,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error retrieving cart items:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const updateCartItem = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    connection.beginTransaction();
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }
    const updatedCartItem = await CartService.updateCartItemQuantity(
      productId,
      quantity
    );
    if (updatedCartItem.quantity === 0) {
      await CartService.deleteCartItem(productId);
      await connection.commit();
      return res.status(200).json({
        success: true,
        message: "Cart item deleted successfully",
      });
    }
    await connection.commit();
    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      updatedCartItem,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating cart item:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const deleteCartItem = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    connection.beginTransaction();
    const { productId } = req.params;
    await CartService.deleteCartItem(productId);
    await connection.commit();
    return res.status(200).json({
      success: true,
      message: "Cart item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cart item:", error);
  }
};
export const checkoutCart = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    connection.beginTransaction();
    const { userId } = req.params;  
    const cartItems = await CartService.getCartItemsByUserId(userId);
    if (!cartItems) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
      });
    }
    const totalAmount = await CartService.calculateTotalAmount(cartItems);
    const order = await OrderService.insertIntoOrder(
      userId,
      totalAmount,
      "pending"
    );
    for (const item of cartItems) {
      await OrderService.insertIntoOrderItem(
        order.insertId,
        item.product_id,
        item.quantity,
        item.price
      );
    }
    await CartService.deleteCart(userId);
    await connection.commit();
    return res.status(200).json({
      success: true,
      message: "Order created successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error checking out cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getOrders = async (req, res) => {
    let connection; 
  try {
    connection = await getConnection();
    connection.beginTransaction();
    const { userId } = req.params;
    const orders = await OrderService.getOrdersByUserId(userId);
    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }
    await connection.commit();
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error retrieving orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const updateOrderStatus = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    connection.beginTransaction();
    const { orderId } = req.params;
    const { status } = req.body;
    const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
    await connection.commit();
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      updatedOrder,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getOrderItemByOrderId = async (req, req) => {
  try {
    const [orderId] = req.body;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Empty Fields",
      });
    }
    const [items] = await OrderService.getOrderItemsByOrderId(orderId);
    if (!items) {
      return res
        .status(404)
        .json({ success: false, message: "No Items For this order" });
    }
    return res
      .status(200)
      .json({ success: true, message: "items fetched Succesfully", items });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
