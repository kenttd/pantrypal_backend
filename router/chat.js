import express from "express";
import auth from "../middleware/auth.js";
import knex from "../knex.js";
import { GoogleGenAI } from "@google/genai";
import systemInstruction from "../instruction.js";
import getTitleInstruction from "../getTitleInstruction.js";

const chatRouter = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
chatRouter.use(auth);

chatRouter.post("/", async (req, res) => {
  let { session_id, message } = req.body || {};
  if (message == null || message == "") {
    return res.status(400).json({
      error: true,
      message: "Message is required",
    });
  }
  if (session_id == null) {
    return res.status(400).json({
      error: true,
      message: "session_id is required",
    });
  }

  let history = null;

  const allowed = await knex("chat_sessions")
    .select("*")
    .where({ id: session_id, user_id: req.user.id })
    .first();
  console.log(allowed);
  console.log(session_id, req.user.id);
  if (!allowed) {
    return res.status(403).json({
      error: true,
      message: "You are not allowed to access this session",
    });
  }
  history = await knex("chat_messages")
    .select("*")
    .where({ session_id: allowed.id });

  history = history.map((item) => {
    return {
      role: item.sender,
      parts: [{ text: item.message }],
    };
  });

  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    history: history != null ? history : [],
    config: {
      systemInstruction: systemInstruction,
    },
  });
  const response = await chat.sendMessage({
    message,
  });

  await knex("chat_sessions")
    .update({
      updated_at: new Date(),
    })
    .where({ id: session_id });

  await knex("chat_messages").insert([
    {
      session_id: session_id,
      sender: "user",
      message,
    },
    {
      session_id: session_id,
      sender: "model",
      message: response.text,
    },
  ]);

  res.status(200).json({
    error: false,
    data: response.text,
  });
});

chatRouter.post("/new", async (req, res) => {
  let { message } = req.body || {};

  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: systemInstruction,
    },
  });

  const response = await chat.sendMessage({
    message,
  });

  const title = await chat.sendMessage({
    message: getTitleInstruction,
  });

  // For MySQL, use insertId instead of .returning()
  const insertResult = await knex("chat_sessions").insert({
    user_id: req.user.id,
    id: response.id,
    title: title.text,
  });

  // Get the inserted ID from insertId (for auto-increment) or use the provided ID
  const session_id = insertResult[0] || response.id;

  await knex("chat_messages").insert([
    {
      session_id: session_id,
      sender: "user",
      message,
    },
    {
      session_id: session_id,
      sender: "model",
      message: response.text,
    },
  ]);

  res.status(201).json({
    error: false,
    session_id,
  });
});

chatRouter.get("/history", async (req, res) => {
  try {
    const history = await knex("chat_sessions as cs")
      .select(
        "cs.*",
        knex("chat_messages")
          .select("message")
          .whereRaw("chat_messages.session_id = cs.id")
          .orderBy("timestamp", "desc")
          .limit(1)
          .as("last_message")
      )
      .where("cs.user_id", req.user.id)
      .orderBy("cs.updated_at", "desc");

    return res.status(200).json({
      error: false,
      data: history,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Failed to fetch history",
      err,
    });
  }
});

chatRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      error: true,
      message: "Session ID is required",
    });
  }

  const session = await knex("chat_sessions")
    .select("*")
    .where({ id, user_id: req.user.id })
    .first();

  if (!session) {
    return res.status(404).json({
      error: true,
      message: "Chat session not found",
    });
  }

  if (session.user_id !== req.user.id) {
    return res.status(403).json({
      error: true,
      message: "You are not allowed to access this session",
    });
  }

  const messages = await knex("chat_messages")
    .select("*")
    .where({ session_id: session.id })
    .orderBy("timestamp", "asc");

  return res.status(200).json({
    error: false,
    data: {
      session,
      messages,
    },
  });
});

export default chatRouter;
