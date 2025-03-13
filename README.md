# JustCMS Nuxt Integration

A simple, type-safe integration for [JustCMS](https://justcms.co) in your NuxtJS project. This integration leverages a single composable that wraps the JustCMS public API endpoints, making it easy to fetch categories, pages, and menus.

## Features

- **TypeScript support:** Fully typed structures for API responses.
- **Single Composable:** All JustCMS API calls are encapsulated in one composable.
- **Easy Integration:** Simply configure your API token and project ID in your Nuxt runtime configuration.
- **Flexible Endpoints:** Supports fetching categories, pages (with filtering and pagination), a page by its slug, a menu by its ID, and layouts (single or multiple).

## Installation

1. **Add the Composable:**

   Copy the [composables/useJustCMS.ts](./composables/useJustCMS.ts) file into your project's `composables` directory.

2. **Install Dependencies:**

   Make sure your project is set up for TypeScript and uses NuxtJS. If not, follow the [NuxtJS installation guide](https://nuxtjs.org/docs/get-started/installation).

## Configuration

You need to supply your JustCMS API token and project ID via Nuxt's runtime configuration. Open your `nuxt.config.ts` (or `nuxt.config.js`) file and add the following:

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      justCmsToken: 'YOUR_JUSTCMS_API_TOKEN',
      justCmsProject: 'YOUR_JUSTCMS_PROJECT_ID'
    }
  }
})
```

- **justCmsToken:** Your JustCMS API token required for authentication.
- **justCmsProject:** Your JustCMS project ID.

## Usage

The integration is provided as a single composable. You can import it into any component and call its functions to fetch data from JustCMS.

For full details on the composable implementation, please refer to the [composables/useJustCMS.ts](./composables/useJustCMS.ts) file.

### Example Component

Below is a simple example that fetches and displays categories:

```vue
<template>
  <div>
    <h2>Categories</h2>
    <ul>
      <li v-for="cat in categories" :key="cat.slug">
        {{ cat.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useJustCMS } from '~/composables/useJustCMS'

const { getCategories } = useJustCMS()
const categories = await getCategories()
</script>
```

This approach leverages Nuxt's server-side rendering capabilities, meaning:
- The data is fetched on the server before the page is sent to the client
- Better SEO as content is present in the initial HTML
- Faster perceived performance as content is immediately visible
- No content layout shift since data is available immediately

### Available Functions

The `useJustCMS` composable provides the following functions:

#### `getCategories()`
Fetches all categories for your project.
```ts
const categories = await getCategories()
// Returns: Category[]
```

#### `getPages(options?: { category?: string; page?: number; perPage?: number })`
Fetches pages with optional filtering and pagination.
```ts
// Get all pages
const allPages = await getPages()

// Get pages from a specific category
const categoryPages = await getPages({ category: 'blog' })

// Get paginated results
const paginatedPages = await getPages({ page: 1, perPage: 10 })
// Returns: { pages: Page[], total: number, currentPage: number, totalPages: number }
```

#### `getPageBySlug(slug: string)`
Fetches a specific page by its slug.
```ts
const page = await getPageBySlug('about-us')
// Returns: Page | null
```

#### `getMenuById(id: string)`
Fetches a menu and its items by ID.
```ts
const menu = await getMenuById('main-menu')
// Returns: Menu | null
```

#### `getLayoutById(id: string)`
Fetches a single layout by its ID.
```ts
const layout = await getLayoutById('footer')
// Returns: Layout
```

#### `getLayoutsByIds(ids: string[])`
Fetches multiple layouts at once by their IDs.
```ts
const layouts = await getLayoutsByIds(['footer', 'header'])
// Returns: Layout[]
```

#### Utility Functions

The composable also provides several helpful utility functions for working with JustCMS content:

#### `isBlockHasStyle(block: ContentBlock, style: string)`
Checks if a content block has a specific style (case-insensitive).
```ts
const isHighlighted = isBlockHasStyle(block, 'highlight')
// Returns: boolean
```

#### `getLargeImageVariant(image: Image)`
Gets the large variant of an image (second variant in the array).
```ts
const largeImage = getLargeImageVariant(page.coverImage)
// Returns: ImageVariant
```

#### `getFirstImage(block: ImageBlock)`
Gets the first image from an image block.
```ts
const firstImage = getFirstImage(imageBlock)
// Returns: Image
```

#### `hasCategory(page: PageDetail, categorySlug: string)`
Checks if a page belongs to a specific category.
```ts
const isBlogPost = hasCategory(page, 'blog')
// Returns: boolean
```

## API Endpoints Overview

The composable wraps the following JustCMS API endpoints:

- **Get Categories:** Retrieve all categories for your project.
- **Get Pages:** Retrieve pages with optional filtering (by category slug) and pagination.
- **Get Page by Slug:** Retrieve detailed information about a specific page.
- **Get Menu by ID:** Retrieve a menu and its items by its unique identifier.
- **Get Layout by ID:** Retrieve detailed information about a single layout, including its items and metadata.
- **Get Layouts by IDs:** Retrieve multiple layouts at once by specifying an array of layout IDs.

For more details on each endpoint, refer to the [JustCMS Public API Documentation](https://justcms.co/api).
