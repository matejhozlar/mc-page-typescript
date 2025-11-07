export const REQUIRED_VARS = [
      "COOKIE_SECRET",
  "CURSEFORGE_API_KEY",
  "CURSEFORGE_PROJECT_ID",
  "DB_HOST",
  "DB_PASSWORD",
  "DB_PORT",
  "DB_USER",
  "MODRINTH_PROJECT_ID",
  "NODE_ENV",
  "PORT",
    ] as const;

    export type RequiredVar = typeof REQUIRED_VARS[number];
    export default REQUIRED_VARS;
    