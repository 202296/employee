const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const asyncHandler = require("express-async-handler");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, asyncHandler(createProduct));

router.get("/:id", asyncHandler(getaProduct));

router.put("/:id", authMiddleware, isAdmin, asyncHandler(updateProduct));
router.delete("/:id", authMiddleware, isAdmin, asyncHandler(deleteProduct));

router.get("/", asyncHandler(getAllProduct));



module.exports =  router