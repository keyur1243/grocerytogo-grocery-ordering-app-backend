import  Express, {Request, Response}  from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import {v2 as cloudinary } from "cloudinary";
import GroceryStoreRoutes from "./routes/GroceryStoreRoute";
import myGroceryStoreRoutes from "./routes/myGroceryStoreRoute";


mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(()=>console.log("Connected to MongoDB Database"));

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = Express();
app.use(Express.json());
app.use(cors());

app.get("/health", async (req: Request, res: Response)=>{
    res.send({ message: "health OK!"});
})

app.use("/api/my/user", myUserRoute);
app.use("/api/my/groceryStore", myGroceryStoreRoutes);
app.use("/api/groceryStore", GroceryStoreRoutes);

app.listen(5050, ()=>{
    console.log("Server started on localhost:5050");
});