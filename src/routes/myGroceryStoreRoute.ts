import express from "express";
import multer from "multer";
import MyGroceryStoreController from "../controllers/MyGroceryStoreController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyGroceryStoreRequest } from "../middleware/validation";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25*1024*1024, //5mb
    },
});

// /api/my/groceryStore
router.get("/", jwtCheck, jwtParse, MyGroceryStoreController.getMyGroceryStore);
router.post("/" ,upload.single("imageFile"),validateMyGroceryStoreRequest,jwtCheck,jwtParse, MyGroceryStoreController.createMyGroceryStore);

router.put("/",upload.single("imageFile"),validateMyGroceryStoreRequest,jwtCheck,jwtParse, MyGroceryStoreController.updateMyGroceryStore);


export default router;