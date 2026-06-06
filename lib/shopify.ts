/**
 * Shopify Storefront API — GraphQL client, types, and all queries/mutations.
 * Only the public storefront token is used here (safe for the browser).
 */

// ─── Environment ──────────────────────────────────────────────────────────────

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? '2024-10';

const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

// ─── Core fetch wrapper ────────────────────────────────────────────────────────

export async function shopifyFetch<T = unknown>({
  query,
  variables,
  cache = 'no-store',
  tags,
}: {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  tags?: string[];
}): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    cache,
    next: tags ? { tags } : { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  const { data, errors } = await res.json();

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data as T;
}

// ─── Shared Types ─────────────────────────────────────────────────────────────

export type Money = { amount: string; currencyCode: string };

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: Array<{ name: string; value: string }>;
  image: ShopifyImage | null;
};

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money };
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
  tags: string[];
  vendor: string;
  productType: string;
  availableForSale: boolean;
  seo: { title: string; description: string };
};

export type ShopifyCollection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
  products: {
    edges: Array<{ node: ShopifyProduct; cursor: string }>;
    pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean; endCursor: string | null };
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: {
    edges: Array<{
      node: CartLine;
    }>;
  };
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    product: { title: string; handle: string };
    image: ShopifyImage | null;
    price: Money;
    selectedOptions: Array<{ name: string; value: string }>;
  };
};

// ─── GraphQL Fragments ────────────────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    images(first: 10) {
      edges { node { url altText width height } }
    }
    variants(first: 250) {
      edges {
        node {
          id
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
          image { url altText width height }
        }
      }
    }
    tags
    vendor
    productType
    availableForSale
    seo { title description }
  }
`;

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost { totalAmount { amount currencyCode } }
          merchandise {
            ... on ProductVariant {
              id
              title
              availableForSale
              product { title handle }
              image { url altText width height }
              price { amount currencyCode }
              selectedOptions { name value }
            }
          }
        }
      }
    }
  }
`;

// ─── Product Queries ───────────────────────────────────────────────────────────

const GET_PRODUCT_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

const GET_PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProducts(
    $first: Int!
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges { node { ...ProductFields } cursor }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const GET_COLLECTION_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetCollection(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image { url altText width height }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        edges { node { ...ProductFields } cursor }
        pageInfo { hasNextPage hasPreviousPage endCursor }
      }
    }
  }
`;

const GET_COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image { url altText width height }
        }
      }
    }
  }
`;

const SEARCH_QUERY = `
  ${PRODUCT_FRAGMENT}
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      edges {
        node {
          ... on Product { ...ProductFields }
        }
      }
      totalCount
    }
  }
`;

// ─── Cart Mutations ────────────────────────────────────────────────────────────

const CART_CREATE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

const GET_CART_QUERY = `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) { ...CartFields }
  }
`;

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>({
    query: GET_PRODUCT_QUERY,
    variables: { handle },
    tags: [`product-${handle}`],
  });
  return data.product;
}

export type ProductSortKey =
  | 'TITLE'
  | 'PRICE'
  | 'BEST_SELLING'
  | 'CREATED_AT'
  | 'UPDATED_AT'
  | 'RELEVANCE';

export async function getProducts({
  first = 12,
  after,
  sortKey = 'BEST_SELLING',
  reverse = false,
  query,
}: {
  first?: number;
  after?: string;
  sortKey?: ProductSortKey;
  reverse?: boolean;
  query?: string;
} = {}): Promise<{
  products: ShopifyProduct[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  const data = await shopifyFetch<{
    products: {
      edges: Array<{ node: ShopifyProduct; cursor: string }>;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  }>({
    query: GET_PRODUCTS_QUERY,
    variables: { first, after, sortKey, reverse, query },
    tags: ['products'],
  });

  return {
    products: data.products.edges.map((e) => e.node),
    hasNextPage: data.products.pageInfo.hasNextPage,
    endCursor: data.products.pageInfo.endCursor,
  };
}

export type CollectionSortKey =
  | 'TITLE'
  | 'PRICE'
  | 'BEST_SELLING'
  | 'CREATED'
  | 'MANUAL'
  | 'COLLECTION_DEFAULT';

export async function getCollection({
  handle,
  first = 12,
  after,
  sortKey = 'BEST_SELLING',
  reverse = false,
}: {
  handle: string;
  first?: number;
  after?: string;
  sortKey?: CollectionSortKey;
  reverse?: boolean;
}): Promise<ShopifyCollection | null> {
  const data = await shopifyFetch<{ collection: ShopifyCollection | null }>({
    query: GET_COLLECTION_QUERY,
    variables: { handle, first, after, sortKey, reverse },
    tags: [`collection-${handle}`],
  });
  return data.collection;
}

export async function getCollections(first = 20): Promise<
  Array<{
    id: string;
    title: string;
    handle: string;
    description: string;
    image: ShopifyImage | null;
  }>
> {
  const data = await shopifyFetch<{
    collections: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          description: string;
          image: ShopifyImage | null;
        };
      }>;
    };
  }>({
    query: GET_COLLECTIONS_QUERY,
    variables: { first },
    tags: ['collections'],
  });
  return data.collections.edges.map((e) => e.node);
}

export async function searchProducts(
  query: string,
  first = 20
): Promise<{ products: ShopifyProduct[]; totalCount: number }> {
  const data = await shopifyFetch<{
    search: {
      edges: Array<{ node: ShopifyProduct }>;
      totalCount: number;
    };
  }>({
    query: SEARCH_QUERY,
    variables: { query, first },
    cache: 'no-store',
  });
  return {
    products: data.search.edges.map((e) => e.node),
    totalCount: data.search.totalCount,
  };
}

// ─── Cart API ──────────────────────────────────────────────────────────────────

export async function createCart(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  /** ISO country code (e.g. 'CR'). Sets the buyer's country so the Shopify
   *  checkout defaults to it instead of the store's home country (US). */
  countryCode?: string,
): Promise<ShopifyCart> {
  const input: {
    lines: Array<{ merchandiseId: string; quantity: number }>;
    buyerIdentity?: { countryCode: string };
  } = { lines };
  if (countryCode) input.buyerIdentity = { countryCode };

  const data = await shopifyFetch<{
    cartCreate: { cart: ShopifyCart; userErrors: Array<{ field: string; message: string }> };
  }>({
    query: CART_CREATE_MUTATION,
    variables: { input },
    cache: 'no-store',
  });

  if (data.cartCreate.userErrors.length) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  return data.cartCreate.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
    query: GET_CART_QUERY,
    variables: { cartId },
    cache: 'no-store',
  });
  return data.cart;
}

export async function addToCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: ShopifyCart; userErrors: Array<{ field: string; message: string }> };
  }>({
    query: CART_LINES_ADD_MUTATION,
    variables: { cartId, lines },
    cache: 'no-store',
  });

  if (data.cartLinesAdd.userErrors.length) {
    throw new Error(data.cartLinesAdd.userErrors[0].message);
  }
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: ShopifyCart; userErrors: Array<{ field: string; message: string }> };
  }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
    cache: 'no-store',
  });

  if (data.cartLinesUpdate.userErrors.length) {
    throw new Error(data.cartLinesUpdate.userErrors[0].message);
  }
  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: ShopifyCart; userErrors: Array<{ field: string; message: string }> };
  }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds },
    cache: 'no-store',
  });

  if (data.cartLinesRemove.userErrors.length) {
    throw new Error(data.cartLinesRemove.userErrors[0].message);
  }
  return data.cartLinesRemove.cart;
}

// ─── Utility helpers ───────────────────────────────────────────────────────────

export function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
}

// Tipo de cambio fijo USD → CRC (actualizar periódicamente)
const USD_TO_CRC = 515;

/**
 * Convierte y formatea el precio en colones costarricenses (₡).
 * Si el producto está en USD, lo convierte automáticamente.
 */
export function formatPriceCR(amount: string, currencyCode: string): string {
  const usd = parseFloat(amount);
  const crc = currencyCode === 'CRC' ? usd : Math.round(usd * USD_TO_CRC);
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(crc);
}

export function getFirstImage(product: ShopifyProduct): ShopifyImage | null {
  return product.images.edges[0]?.node ?? null;
}

export function getFirstVariant(product: ShopifyProduct): ShopifyVariant | null {
  return product.variants.edges[0]?.node ?? null;
}

export function hasDiscount(product: ShopifyProduct): boolean {
  const compare = parseFloat(product.compareAtPriceRange.minVariantPrice.amount);
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  return compare > price;
}

export function discountPercent(product: ShopifyProduct): number {
  const compare = parseFloat(product.compareAtPriceRange.minVariantPrice.amount);
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}
