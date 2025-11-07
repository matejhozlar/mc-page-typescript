import multer from "multer";
import config from "@/config";
import type { Request } from "express";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.Multer.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const isAllowed = config.Multer.ALLOWED_MIME_TYPES.some((type) => {
      file.mimetype.startsWith(type);
    });

    if (!isAllowed) {
      return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
  },
});

export default upload;
