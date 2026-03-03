import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, phone, address, product, amount } = req.body;

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
    });

    await supabase.from("orders").insert([
      {
        name,
        phone,
        address,
        product,
        amount,
        razorpay_order_id: order.id,
        status: "created",
      },
    ]);

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
}
