import { createPaymentService, confirmPaymentService } from "./payment.service.js";
import { ApiError } from "../../utils/apiError.js";

export const createPayment = async (req, res) => {
        const { id } = req.user;
        const { bookingId } = req.params;

        const idempotencyKey = req.headers["idempotency-key"]?.toString().trim();

        if (!idempotencyKey) {
            throw new ApiError(400, "Idempotency key is required");
        }

        const payment = await createPaymentService(
            id,
            bookingId,
            idempotencyKey
        );

        res.status(201).json({
            success: true,
            message: "Payment created successfully",
            data: payment,
        });
};

export const confirmPayment = async (req, res) => {
    const { id } = req.user;
    const { paymentId } = req.params;

    const payment = await confirmPaymentService(id, paymentId);

    res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
        data: payment,
    });
}