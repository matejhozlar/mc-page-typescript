export interface LinksConfig {
  web: string;
  map: string;
  adminPanel: string;
  modpack: string;
}

const config = {
  web: process.env.WEB_URL,
  map: process.env.WEB_MAP_URL,
  adminPanel: process.env.WEB_ADMIN_PANEL_URL,
  modpack: process.env.WEB_MODPACK_URL,
} satisfies LinksConfig;

export default config;
