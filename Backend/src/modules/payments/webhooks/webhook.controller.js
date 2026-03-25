import {
  confirmPaymentService,
  failPaymentService,
} from "../payment.service.js";

export const handleWebhook = async (req, res) => {
  try {
    const payload = JSON.parse(req.body.toString());

    const event = payload.event;

    // 🔥 Only handle relevant events
    if (!["payment.captured", "payment.failed"].includes(event)) {
      return res.status(200).end();
    }

    const entity = payload.payload.payment.entity;
    const razorpayPaymentId = entity.id;
    const internalPaymentId = entity.notes.paymentId;

    if (!razorpayPaymentId) {
      return res.status(200).end(); // ignore silently
    }

    switch (event) {
      case "payment.captured":
        await confirmPaymentService(internalPaymentId, razorpayPaymentId);
        break;

      case "payment.failed":
        await failPaymentService(internalPaymentId, razorpayPaymentId, {
          reason: entity.error_reason,
          metadata: entity,
        });
        break;
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);

    // 🔥 Always return 200 (prevent retries)
    return res.status(200).json({ success: false });
  }
};