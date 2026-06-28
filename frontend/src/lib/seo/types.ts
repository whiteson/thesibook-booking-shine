export type YoastOgImage = {
  url?: string;
  width?: number | string;
  height?: number | string;
  type?: string;
};

export type YoastHeadJson = {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string[] | Record<string, string | number | boolean>;
  og_title?: string;
  og_description?: string;
  og_image?: YoastOgImage[] | YoastOgImage | string;
  og_url?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  [key: string]: unknown;
};
