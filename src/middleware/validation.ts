import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string"),
  body("addressLine1")
    .isString()
    .notEmpty()
    .withMessage("AddressLine1 must be a string"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  handleValidationErrors,
];

export const validateMyGroceryStoreRequest = [
  body("groceryStoreName").notEmpty().withMessage("Grocery-Store name is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("country").notEmpty().withMessage("Country is required"),
  body("deliveryPrice").isFloat({ min: 0 }).withMessage("Delivery price must be a positive number"),
  body("estimatedDeliveryTime").isInt({ min: 0 }).withMessage("Estimated delivery time must be a positive number"),
  body("categories").isArray().withMessage("Categories must be an array").not().isEmpty().withMessage("Categories array cannot be empty"),
  body("Product").isArray().withMessage("Product must be an array"),
  body("Product.*.productName").notEmpty().withMessage("Product name is required"),
  body("Product.*.category").notEmpty().withMessage("Product category is required"),
  body("Product.*.price").isFloat({ min: 0 }).withMessage("Product price must be a positive number"),
  body("Product.*.description").notEmpty().withMessage("Product Description is required"),
  handleValidationErrors,
];