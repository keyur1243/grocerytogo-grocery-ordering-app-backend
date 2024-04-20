import Stripe from "stripe";
import { Request, Response } from "express";
import GroceryStore, { ProductType } from "../models/groceryStore";
import Order from "../models/order";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("groceryStore")
      .populate("user");

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

type CheckoutSessionRequest = {
  cartItems: {
    productId: any;
    productName: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  groceryStoreId: string;
};

   const stripeWebhookHandler = async (req: Request, res: Response) => {  
     let event;
  
     try {
       const sig = req.headers["stripe-signature"];
       event = STRIPE.webhooks.constructEvent(
         req.body,
         sig as string,
         STRIPE_ENDPOINT_SECRET
       );
     } catch (error: any) {
       console.log(error);
       return res.status(400).send(`Webhook error: ${error.message}`);
     }
  
    if (event.type === "checkout.session.completed") {
      const order = await Order.findById(event.data.object.metadata?.orderId);
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      order.totalAmount = event.data.object.amount_total;
      order.status = "paid";
  
      await order.save();
    }
  
     res.status(200).send();
 }; 
 
const createCheckoutSession = async (req: Request, res: Response) => {
  try { 
     const checkoutSessionRequest: CheckoutSessionRequest = req.body;

     const groceryStore = await GroceryStore.findById(
       checkoutSessionRequest.groceryStoreId
     );

    if (!groceryStore) {
      throw new Error("Grocery-Store not found");
    }

    const newOrder = new Order({
      groceryStore: groceryStore,
      user: req.userId,
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    const lineItems = createLineItems(
      checkoutSessionRequest,
      groceryStore.Product
    );

    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      groceryStore.deliveryPrice,
      groceryStore._id.toString()
    );

     if (!session.url) {
       return res.status(500).json({ message: "Error creating stripe session" });
     }

    await newOrder.save();
    res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.raw.message });
  }
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  Product: ProductType[]
) => {
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const product = Product.find(
      (item) => item._id.toString() === cartItem.productId.toString()
    );

    if (!product) {
      throw new Error(`Product item not found: ${cartItem.productId}`);
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "cad",
        unit_amount: product.price,
        product_data: {
          name: product.productName,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };

    return line_item;
  });

  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  groceryStoreId: string
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "cad",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      groceryStoreId,
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${groceryStoreId}?cancelled=true`,
  });

  return sessionData;
};

export default {
  getMyOrders,
  createCheckoutSession,
  stripeWebhookHandler,
};