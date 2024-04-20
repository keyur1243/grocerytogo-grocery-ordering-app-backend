import { Request, Response } from "express";
import GroceryStore from "../models/groceryStore";

const getGroceryStore = async (req: Request, res: Response) => {
  try {
    const groceryStoretId = req.params.groceryStoreId;

    const groceryStore = await GroceryStore.findById(groceryStoretId);
    if (!groceryStore) {
      return res.status(404).json({ message: "Grocery-Store not found" });
    }
    res.json(groceryStore);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};


const getRandomGroceryStores = async (req: Request, res: Response) => {

  try {

    const groceryStores = await GroceryStore.aggregate([{ $sample: { size: 3 } }]);
    
    if (groceryStores.length === 0) {
      return res.status(404).json({ message: "No grocery stores found" });
    }
    
    // random grocery stores as the response
    res.json(groceryStores);

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });

  }
};



const searchGroceryStore = async (req: Request, res: Response) => {
    try {
      const city = req.params.city;
  
      const searchQuery = (req.query.searchQuery as string) || "";
      const selectedCategories = (req.query.selectedCategories as string) || "";
      const sortOption = (req.query.sortOption as string) || "lastUpdated";
      const page = parseInt(req.query.page as string) || 1;
     
      let query: any = {};

    query["city"] = new RegExp(city, "i");
    const cityCheck = await GroceryStore.countDocuments(query);
    if (cityCheck === 0) { 
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    if (selectedCategories) {
        const categoriesArray = selectedCategories
          .split(",")
          .map((category) => new RegExp(category, "i"));
  
        query["categories"] = { $all: categoriesArray };
      }

      if (searchQuery) {
        const searchRegex = new RegExp(searchQuery, "i");
        query["$or"] = [
          { groceryStoreName: searchRegex },
          { categories: { $in: [searchRegex] } },
        ];
      }
  
      const pageSize = 7;
      const skip = (page - 1) * pageSize;
  
      // sortOption = "lastUpdated"
    const groceryStores = await GroceryStore.find(query)
    .sort({ [sortOption]: 1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  const total = await GroceryStore.countDocuments(query);

  const response = {
    data: groceryStores,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / pageSize),
    },
  };

  res.json(response);
} catch (error) {
  console.log(error);
  res.status(500).json({ message: "Something went wrong" });
}
};

export default {
getGroceryStore,  
searchGroceryStore,
getRandomGroceryStores
};