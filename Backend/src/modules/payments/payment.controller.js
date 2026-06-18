import {
  createPaymentService,
  getPaymentService,
} from "./payment.service.js";
import { ApiError } from "../../utils/apiError.js";

export const createPayment = async (req, res) => {
  const key = req.headers["idempotency-key"]?.toString().trim();
  if (!key) throw new ApiError(400, "Idempotency key required");

  const { payment, order } = await createPaymentService(req.user.id, req.targetBooking._id, key);

  res.status(201).json({
    success: true,
    data: { payment, order },
  });
};

export const getPayment = async (req, res) => {
  const payment = await getPaymentService(req.targetPayment._id, req.user.id);

  res.status(200).json({
    success: true,
    data: payment,
  });
};