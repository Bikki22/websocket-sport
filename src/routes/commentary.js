import { Router } from "express";
import { matchIdParamSchema } from "../validation/matches.js";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from "../validation/commentary.js";
import { commentary } from "../db/schema.js";
import { db } from "../db/db.js";
import { desc } from "drizzle-orm";

export const commentaryRouter = Router();

commentaryRouter.get("/", async (req, res) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid match id", details: paramsResult.error.issues });
  }

  const queryResult = listCommentaryQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    res.status(400).json({
      error: "Invalid query parameter",
      details: queryResult.error.issues,
    });
  }

  try {
    const { id: matchId } = paramsResult.data;

    const { limit = 10 } = queryResult.data;

    const safeLimit = Math.min(limit, MAX_LIMIT);
    const results = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(safeLimit);

    res.status(200).json({ data: results });
  } catch (error) {
    console.error("Failed to fetch commentary", error);
    res.status(500).json({ error: "Failed to fetch commentary" });
  }
});

commentaryRouter.post("/", async (req, res) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid match Id", details: paramsResult.error.issues });
  }

  const bodyResult = createCommentarySchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({ error: "Invalid commentary payload" });
  }

  try {
    const [result] = await db
      .insert(commentary)
      .values({
        matchId: paramsResult.data.id,
        ...bodyResult.data,
      })

      .returning();
    res.status(201).json({ data: result });
  } catch (error) {
    console.error("Failed to create commentary:", error);
    res.status(500).json({ error: "Failed to create commentary" });
  }
});
