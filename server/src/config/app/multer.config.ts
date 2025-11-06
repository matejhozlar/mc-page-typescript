export interface MulterConfig {
  MAX_FILE_SIZE_MB: number;
  ALLOWED_MIME_TYPES: string[];
}

const config = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_MIME_TYPES: ["image/"],
} satisfies MulterConfig;

export default config;
