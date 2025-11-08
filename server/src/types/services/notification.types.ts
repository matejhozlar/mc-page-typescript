export interface PendingCompanyNotification {
  id: number;
  name: string;
  founder_uuid: string | null;
  short_description: string | null;
}

export interface CompanyEditNotification {
  edit_id: number;
  company_id: number | null;
  editor_uuid: string | null;
  name?: string;
  short_description?: string;
}

export interface PendingShopNotification {
  id: number;
  name: string;
  company_id: number | null;
  company_name?: string;
  founder_uuid: string | null;
  short_description?: string;
}

export interface ShopEditNotification {
  edit_id: number;
  shop_id: number;
  company_id: number;
  editor_uuid: string;
  name?: string;
  short_description?: string;
}

export interface AdminNoticeParams {
  subject: string;
  plain: string;
  html: string;
  embed: {
    embeds: any[];
    components: any[];
  };
  client: import("discord.js").Client;
}
