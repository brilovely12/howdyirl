export type Group = {
  id: string;
  creator_id: string | null;
  creator_handle: string | null;
  name: string;
  description: string;
  claimed: boolean;
  joins_count: number;
  external_link: string | null;
  link_label: string | null;
  image_url: string | null;
  images: string[];
  tags: string[];
  status: string;
  updated_at: string;
};

export type EventRow = {
  id: string;
  creator_id: string | null;
  creator_handle: string | null;
  host_group_id: string | null;
  host_group_name: string | null;
  name: string;
  description: string;
  starts_at: string;
  recurrence: string | null;
  recurrence_end: string | null;
  next_at?: string;
  external_link: string | null;
  image_url: string | null;
  images: string[];
  tags: string[];
  status: string;
};

export type Update = { id: string; body: string; posted_at: string };

export type Comment = {
  id: string;
  author_handle: string;
  body: string;
  edited: boolean;
  quote_handle: string | null;
  quote_text: string | null;
  created_at: string;
};

export type Thread = {
  id: string;
  creator_id: string | null;
  creator_handle: string;
  section: string;
  title: string;
  body: string;
  status: string;
  reply_count: number;
  created_at: string;
  updated_at: string;
};

export type Spot = {
  id: string;
  creator_id: string | null;
  creator_handle: string | null;
  name: string;
  description: string;
  address: string;
  claimed: boolean;
  joins_count: number;
  external_link: string | null;
  link_label: string | null;
  image_url: string | null;
  images: string[];
  tags: string[];
  status: string;
  updated_at: string;
};

export type Tag = { id: string; name: string; sort: number };

export type ForumSection = {
  id: string;
  slug: string;
  label: string;
  description: string;
  sort: number;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  body: string;
  in_nav: boolean;
  is_rules: boolean;
};

export type Notification = {
  id: string;
  kind: string;
  body: string;
  link_type: string | null;
  link_id: string | null;
  read: boolean;
  created_at: string;
};

export type SearchResult<T> = { rows: T[]; total: number };
