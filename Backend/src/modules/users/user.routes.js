import express from "express";

const router = express.Router();

router.get("/user/:id", getUserDetails);

export default router;