import express, { type Express } from "express";

export function createApp(): Express {
  const app = express();

  app.set("trust proxy", 1);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  return app;
}
