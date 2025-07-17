import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCreator,
  toggleProductStatus
} from "../controllers/productController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected routes (authentication required)
router.post("/", authenticateToken, createProduct);
router.put("/:id", authenticateToken, updateProduct);
router.delete("/:id", authenticateToken, deleteProduct);
router.get("/creator/:creatorId", getProductsByCreator);
router.patch("/:id/toggle-status", authenticateToken, toggleProductStatus);

export default router; 