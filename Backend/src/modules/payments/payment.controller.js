import {
  createPaymentService,
  getPaymentsService,
  getPaymentByIdService,
  verifyPaymentService,
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

export const verifyPayment = async (req, res) => {
  const result = await verifyPaymentService(req.user.id, req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getPayments = async(req, res) => {
  const payments = await getPaymentsService(req.user.id);

  res.status(200).json({
    success: true,
    data: payments,
  });
}

export const getPaymentById = async (req, res) => {
  const payment = await getPaymentByIdService(req.targetPayment._id, req.user.id);

  res.status(200).json({
    success: true,
    data: payment,
  });
};