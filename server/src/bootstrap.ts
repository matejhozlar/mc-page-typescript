import loggerInstance from "./logger";
global.logger = loggerInstance;
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { validateEnv } from "./utils/env/env-validate";
validateEnv();
