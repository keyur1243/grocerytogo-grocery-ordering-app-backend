import  express, {Request, Response}  from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import {v2 as cloudinary } from "cloudinary";
import myGroceryStoreRoute from "./routes/MyGroceryStoreRoute";
import groceryStoreRoutes from "./routes/GroceryStoreRoute";
import orderRoute from "./routes/OrderRoutes";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(()=>console.log("Connected to MongoDB Database"));

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})
//

const app = express();

app.use(cors());

app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));

app.use(express.json());

app.get("/health", async (req: Request, res: Response)=>{
    res.send({ message: "health OK!"});
})

app.use("/api/my/user", myUserRoute);
app.use("/api/my/groceryStore", myGroceryStoreRoute);
app.use("/api/groceryStore", groceryStoreRoutes);
app.use("/api/order", orderRoute);

app.listen(5050, ()=>{
    console.log("Server started on localhost:5050");
});