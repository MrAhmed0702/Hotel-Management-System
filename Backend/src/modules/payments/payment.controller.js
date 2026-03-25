import {
  createPaymentService,
  createRazorpayOrder,
} from "./payment.service.js";
import { ApiError } from "../../utils/apiError.js";

export const createPayment = async (req, res) => {
  const { id } = req.user;
  const { bookingId } = req.params;

  const key = req.headers["idempotency-key"]?.toString().trim();
  if (!key) throw new ApiError(400, "Idempotency key required");

  const payment = await createPaymentService(id, bookingId, key);
  const order = await createRazorpayOrder(payment);

  res.status(201).json({
    success: true,
    data: { payment, order },
  });
};

export const getPayment = async (req, res) => {
  res.status(200).json({ message: "Not implemented yet" });
};