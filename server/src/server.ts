import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { validateEnv } from "./utils/env/env-validate";
import loggerInstance from "./logger";
validateEnv();

global.logger = loggerInstance;
