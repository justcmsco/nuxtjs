import { useRuntimeConfig } from 'nuxt/app';

/**
 * Categories
 */
export interface Category {
  
  name: string
  slug: string
}

export interface CategoriesResponse {
  categories: Category[]
}

/**
 * Image types
 */
export interface ImageVariant {
  url: string
  width: number
  height: number
  filename: string
}

export interface Image {
  alt: string
  variants: ImageVariant[]
}

/**
 * Pages
 */
export interface PageSummary {
  title: string
  subtitle: string
  coverImage: Image | null
  slug: string
  categories: Category[]
  createdAt: string
  updatedAt: string
}

export interface PagesResponse {
  items: PageSummary[]
  total: number
}

/**
 * Content Blocks for a single page
 */
export interface HeaderBlock {
  type: 'header'
  styles: string[]
  header: string
  subheader: string | null
  size: string
}

export interface ListBlock {
  type: 'list'
  styles: string[]
  options: {
    title: string
    subtitle?: string | null
  }[]
}

export interface EmbedBlock {
  type: 'embed'
  styles: string[]
  url: string
}

export interface ImageBlock {
  type: 'image'
  styles: string[]
  images: {
    alt: string
    variants: ImageVariant[]
  }[]
}

export interface CodeBlock {
  type: 'code'
  styles: string[]
  code: string
}

export interface TextBlock {
  type: 'text'
  styles: string[]
  text: string
}

export interface CtaBlock {
  type: 'cta'
  styles: string[]
  text: string
  url: string
  description?: string | null
}

export interface CustomBlock {
  type: 'custom'
  styles: string[]
  blockId: string
  [key: string]: any
}

export type ContentBlock =
  | HeaderBlock
  | ListBlock
  | EmbedBlock
  | ImageBlock
  | CodeBlock
  | TextBlock
  | CtaBlock
  | CustomBlock

export interface PageDetail {
  title: string
  subtitle: string
  meta: {
    title: string
    description: string
  }
  coverImage: Image | null
  slug: string
  categories: Category[]
  content: ContentBlock[]
  createdAt: string
  updatedAt: string
}

/**
 * Menus
 */
export interface MenuItem {
  title: string
  subtitle?: string
  icon: string
  url: string
  styles: string[]
  children: MenuItem[]
}

export interface Menu {
  id: string
  name: string
  items: MenuItem[]
}

/**
 * Layouts
 */
export interface LayoutItem {
  label: string
  description: string
  uid: string
  type: string
  value: any
}

export interface Layout {
  id: string
  name: string
  items: LayoutItem[]
}

export interface PageFilters {
  category: {
    slug: string
  }
}

/**
 * Composable: useJustCMS
 *
 * Provides methods for fetching JustCMS data:
 * - getCategories()
 * - getPages()
 * - getPageBySlug()
 * - getMenuById()
 * - getLayoutById()
 * - getLayoutsByIds()
 *
 * The API token and project ID are taken either from the runtime config (config.public.justCmsToken and config.public.justCmsProject)
 * or from the optional parameters.
 */
export function useJustCms(apiToken?: string, projectIdParam?: string) {
  const config = useRuntimeConfig()
  const token = apiToken || config.public.justCmsToken
  const projectId = projectIdParam || config.public.justCmsProject

  if (!token) {
    throw new Error('JustCMS API token is required')
  }
  if (!projectId) {
    throw new Error('JustCMS project ID is required')
  }

  // Base URL without the project segment.
  const BASE_URL = 'https://api.justcms.co/public'

  /**
   * Helper: Makes a GET request to a JustCMS endpoint.
   * @param endpoint The endpoint (e.g. 'pages' or 'menus/main')
   * @param queryParams Optional query parameters.
   *
   * The full URL is constructed as: `${BASE_URL}/${projectId}/${endpoint}`
   * If no endpoint is provided, the URL points to `${BASE_URL}/${projectId}`.
   */
  const get = async <T>(
    endpoint: string = '',
    queryParams?: Record<string, any>
  ): Promise<T> => {
    // Construct the full URL using the projectId from config.
    const url = new URL(`${BASE_URL}/${projectId}${endpoint ? '/' + endpoint : ''}`)
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`JustCMS API error ${response.status}: ${errorText}`)
    }
    return response.json()
  }

  /**
   * Retrieves all categories.
   */
  const getCategories = async (): Promise<Category[]> => {
    const data = await get<CategoriesResponse>() // Calls `${BASE_URL}/${projectId}`
    return data.categories
  }

  /**
   * Retrieves pages with optional filtering and pagination.
   * @param params.filterCategorySlug Filter pages by a specific category slug.
   * @param params.start Pagination start index.
   * @param params.offset Number of items to return.
   */
  const getPages = async (params?: {
    filters?: PageFilters
    start?: number
    offset?: number
  }): Promise<PagesResponse> => {
    const query: Record<string, any> = {}
    if (params?.filters?.category?.slug) {
      query['filter.category.slug'] = params.filters.category.slug
    }
    if (params?.start !== undefined) {
      query['start'] = params.start
    }
    if (params?.offset !== undefined) {
      query['offset'] = params.offset
    }
    return get<PagesResponse>('pages', query)
  }

  /**
   * Retrieves a single page by its slug.
   * @param slug The page slug.
   * @param version (Optional) If provided, adds the `v` query parameter (e.g. 'draft').
   */
  const getPageBySlug = async (
    slug: string,
    version?: string
  ): Promise<PageDetail> => {
    const query: Record<string, any> = {}
    if (version) {
      query['v'] = version
    }
    return get<PageDetail>(`pages/${slug}`, query)
  }

  /**
   * Retrieves a single menu by its ID.
   * @param id The menu ID.
   */
  const getMenuById = async (id: string): Promise<Menu> => {
    return get<Menu>(`menus/${id}`)
  }

  const isBlockHasStyle = (block: any, style: string) => {
    if (block.styles.map((s: string) => s.toLowerCase()).includes(style.toLowerCase())) {
      return true;
    }
    return false;
  };

  const getLargeImageVariant = (image: Image) => {
    return image.variants[1];
  };

  const getFirstImage = (block: any) => {
    return block.images[0];
  };

  const hasCategory = (page: PageDetail, categorySlug: string) => {
    return page.categories.map((category) => category.slug).includes(categorySlug);
  };

  /**
   * Retrieves a single layout by its ID.
   * @param id The layout ID.
   */
  const getLayoutById = async (id: string): Promise<Layout> => {
    return get<Layout>(`layouts/${id}`)
  }

  /**
   * Retrieves multiple layouts by their IDs.
   * @param ids Array of layout IDs.
   */
  const getLayoutsByIds = async (ids: string[]): Promise<Layout[]> => {
    const idsString = ids.join(';')
    return get<Layout[]>(`layouts/${idsString}`)
  }

  return {
    getCategories,
    getPages,
    getPageBySlug,
    getMenuById,
    getLayoutById,
    getLayoutsByIds,
    isBlockHasStyle,
    getLargeImageVariant,
    getFirstImage,
    hasCategory
  }
}
