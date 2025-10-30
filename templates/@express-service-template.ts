import express from "express";
import { z } from "zod";

const router = express.Router();

const ExampleSchema = z.object({
  id: z.string(),
  name: z.string(),
});

router.get("/", async (req, res, next) => {
  try {
    const data = ExampleSchema.parse({ id: "1", name: "Test" });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
