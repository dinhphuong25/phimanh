/**
 * Centralized TypeScript types for PhimAPI responses.
 * Replace `any` usage gradually throughout the codebase.
 */

export interface MovieCategory {
  id: string;
  name: string;
  slug: string;
}

export interface MovieCountry {
  id: string;
  name: string;
  slug: string;
}

export interface MovieEpisode {
  server_name: string;
  server_data: {
    name: string;
    slug: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
  }[];
}

export interface Movie {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  content: string;
  type: 'single' | 'series' | 'hoathinh' | 'tvshows';
  status: string;
  thumb_url: string;
  poster_url: string;
  is_copyright: boolean;
  sub_docquyen: boolean;
  chieurap: boolean;
  trailer_url?: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: 'HD' | 'FHD' | 'SD' | 'CAM' | string;
  lang: string;
  notify: string;
  showtimes: string;
  year: number;
  view: number;
  actor: string[];
  director: string[];
  category: MovieCategory[];
  country: MovieCountry[];
  imdb?: { id: string; rating: number };
  tmdb?: { id: string; type: string; season: number; vote_average: number; vote_count: number };
  modified?: { time: string };
}

export interface MovieListItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  type: Movie['type'];
  thumb_url: string;
  poster_url: string;
  year: number;
  quality: Movie['quality'];
  lang: string;
  episode_current: string;
  category: MovieCategory[];
  country: MovieCountry[];
  modified?: { time: string };
}

export interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  status: boolean;
  items: T[];
  params?: {
    pagination: Pagination;
  };
}
