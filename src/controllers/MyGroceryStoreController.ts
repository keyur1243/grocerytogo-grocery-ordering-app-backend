import { Request, Response } from "express";
import cloudinary from "cloudinary";
import GroceryStore from "../models/groceryStore"; // Assuming the model is properly imported
import mongoose from "mongoose";




const getMyGroceryStore = async (req: Request, res: Response) => {
  try {
    const groceryStore = await GroceryStore.findOne({ user: req.userId });
    if (!groceryStore) {
      return res.status(404).json({ message: "Grocery-Store not found" });
    }
    res.json(groceryStore);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching Grocery-Store" });
  }
};








const createMyGroceryStore = async (req: Request, res: Response) => {
  try {
    const existingGroceryStore = await GroceryStore.findOne({ user: req.userId });

    if (existingGroceryStore) {
      return res.status(409).json({ message: "User's grocery store already exists" });
    }

    const imageUrl = await uploadImage(req.file as Express.Multer.File);
    
    const groceryStore = new GroceryStore(req.body);
    groceryStore.imageUrl = imageUrl;
    groceryStore.user = new mongoose.Types.ObjectId(req.userId);
    groceryStore.lastUpdated= new Date();
    await groceryStore.save();
    res.status(201).send(groceryStore);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


const updateMyGroceryStore = async (req: Request, res: Response) => {
  try {
    const groceryStore = await GroceryStore.findOne({
      user: req.userId,
    });

    if (!groceryStore) {
      return res.status(404).json({ message: "Grocery-Store not found" });
    }

    groceryStore.groceryStoreName = req.body.groceryStoreName;
    groceryStore.city = req.body.city;
    groceryStore.country = req.body.country;
    groceryStore.deliveryPrice = req.body.deliveryPrice;
    groceryStore.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    groceryStore.categories = req.body.categories;
    groceryStore.Product = req.body.Product;
    groceryStore.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      groceryStore.imageUrl = imageUrl;
    }

    await groceryStore.save();
    res.status(200).send(groceryStore);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


const uploadImage =async (file:Express.Multer.File) => {
    const image =file;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI =`data:${image.mimetype};base64,${base64Image}`;
    
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
}


export default {
  getMyGroceryStore,
  createMyGroceryStore,
  updateMyGroceryStore,
};
