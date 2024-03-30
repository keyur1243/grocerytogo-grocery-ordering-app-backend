import express from "express";
import { param } from "express-validator";
import GroceryStoreController from "../controllers/GroceryStoreController";

const router = express.Router();

router.get(
  "/:groceryStoreId",
  param("groceryStoreId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("groceryStoreId paramenter must be a valid string"),
  GroceryStoreController.getGroceryStore
);


router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City paramenter must be a valid string"),
    GroceryStoreController.searchGroceryStore
);

export default router;