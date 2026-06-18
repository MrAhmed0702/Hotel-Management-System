import Payment from "../modules/payments/payment.model.js";
import { ApiError } from "../utils/apiError.js";
import { Types } from "mongoose";

export const validatePaymentId = async ( req, res, next ) => {
  try {
    const { paymentId } = req.params;

    if (!Types.ObjectId.isValid(paymentId)) {
      throw new ApiError(
        400,
        "Invalid Payment ID"
      );
    }

    const payment = await Payment.findOne({ _id: paymentId, userId: req.user.id });

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    req.targetPayment = payment;

    next();
  } catch (error) {
    next(error);
  }
};