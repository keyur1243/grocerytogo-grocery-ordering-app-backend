import mongoose, { InferSchemaType } from "mongoose";

const productSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  productName: { type: String, required: true },
  category: { type: String, required: true }, // You can consider using a single category for each item
  price: { type: Number, required: true },
  description: { type: String, required: true },
});

export type ProductType = InferSchemaType<typeof productSchema>;

const groceryStoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  groceryStoreName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  // Include categories of products the store offers
  categories: [{ type: String, required: true }],
  Product: [productSchema],
  imageUrl: { type: String, required: true },
  lastUpdated: { type: Date, required: true },
});

const GroceryStore = mongoose.model('GroceryStore', groceryStoreSchema);

export default GroceryStore;
