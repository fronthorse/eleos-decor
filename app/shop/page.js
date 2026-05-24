"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Navbar from ".././components/Navbar";
import Footer from ".././components/Footer";
import ProductCard from ".././components/ProductCard";
import ProductSkeleton from ".././components/ProductSkeleton";
import EmptyState from ".././components/EmptyState";

import { createClient } from "../../lib/supabase/client";
import {
  applyProductSearchFilter,
  searchProductsWithFullText,
  sanitizeProductSearchTerm,
} from "../../lib/productSearch";
import {
  getCuratedFilterHref,
  getCuratedShopFilter,
  getProductStyleScore,
  SHOP_SPACE_FILTERS,
  STYLED_COLLECTION_FILTERS,
} from "../../lib/shopCuration";

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 450;
const PRODUCT_LIST_FIELDS =
  "id,title,category,description,price,image_url,created_at";

const shopSpaces = SHOP_SPACE_FILTERS;
const styledCollections = STYLED_COLLECTION_FILTERS;

function getPositivePage(value) {
  const page = Number.parseInt(value || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function applyProductSort(query, sort) {
  if (sort === "oldest") {
    return query.order("created_at", { ascending: true });
  }

  if (sort === "price-low") {
    return query.order("price", { ascending: true });
  }

  if (sort === "price-high") {
    return query.order("price", { ascending: false });
  }

  return query.order("created_at", { ascending: false });
}

function ShopContent() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fetchIdRef = useRef(0);

  const categoryParam = searchParams.get("category") || "All";
  const spaceParam = searchParams.get("space") || "";
  const collectionParam = searchParams.get("collection") || "";
  const queryParam =
    searchParams.get("search") || searchParams.get("query") || "";
  const sortParam = searchParams.get("sort") || "newest";
  const pageParam = getPositivePage(searchParams.get("page"));
  const curatedFilter = useMemo(
    () =>
      getCuratedShopFilter({
        space: spaceParam,
        collection: collectionParam,
      }),
    [collectionParam, spaceParam]
  );

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const categories = [
    "All",
    "Frames",
    "Mirrors",
    "Wall Clocks",
    "Wall Art",
    "Rugs",
    "Throw Pillows",
    "Throw Blankets",
    "Bedsheets",
    "Tables",
    "Chairs",
    "Dining Sets",
    "Ornaments",
    "Figurines",
    "Faux Books",
    "Lamps",
    "Lighting",
    "Diffusers",
    "Humidifiers",
    "Scented Candles",
    "Plants",
    "Flowers",
    "Artificial Water Fountains",
  ];

  const hasActiveFilters =
    categoryParam !== "All" ||
    Boolean(curatedFilter) ||
    Boolean(queryParam) ||
    sortParam !== "newest";
  const activeFilterLabels = [
    curatedFilter?.label || "",
    categoryParam !== "All" ? categoryParam : "",
    queryParam ? `Search: ${queryParam}` : "",
    sortParam !== "newest"
      ? {
          oldest: "Oldest first",
          "price-low": "Price low to high",
          "price-high": "Price high to low",
        }[sortParam]
      : "",
  ].filter(Boolean);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const showingStart = totalCount === 0 ? 0 : (pageParam - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(pageParam * PAGE_SIZE, totalCount);

  const updateShopParams = useCallback((updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "All" || value === "newest" || value === "1") {
        params.delete(key);
        return;
      }

      params.set(key, String(value));
    });

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  const fetchCuratedProducts = useCallback(
    async ({ cleanSearch, from }) => {
      const tierResults = await Promise.all(
        curatedFilter.tiers.map(async (tier) => {
          let countQuery = supabase
            .from("products")
            .select("id", {
              count: "exact",
              head: true,
            })
            .in("category", tier.categories);

          countQuery = applyProductSearchFilter(countQuery, cleanSearch);

          const { count, error } = await countQuery;

          if (error) {
            throw error;
          }

          return {
            ...tier,
            count: count || 0,
          };
        })
      );
      const total = tierResults.reduce((sum, tier) => sum + tier.count, 0);
      let remainingOffset = from;
      let remainingLimit = PAGE_SIZE;
      const selectedProducts = [];

      for (const tier of tierResults) {
        if (remainingLimit <= 0) {
          break;
        }

        if (remainingOffset >= tier.count) {
          remainingOffset -= tier.count;
          continue;
        }

        const tierLimit = Math.min(remainingLimit, tier.count - remainingOffset);
        let productsQuery = supabase
          .from("products")
          .select(PRODUCT_LIST_FIELDS)
          .in("category", tier.categories);

        productsQuery = applyProductSearchFilter(productsQuery, cleanSearch);
        productsQuery = applyProductSort(productsQuery, sortParam);

        const { data, error } = await productsQuery.range(
          remainingOffset,
          remainingOffset + tierLimit - 1
        );

        if (error) {
          throw error;
        }

        const tierProducts = data || [];

        if (sortParam === "newest" && curatedFilter.styleKeywords.length > 0) {
          tierProducts.sort((first, second) => {
            return (
              getProductStyleScore(second, curatedFilter.styleKeywords) -
              getProductStyleScore(first, curatedFilter.styleKeywords)
            );
          });
        }

        selectedProducts.push(...tierProducts);
        remainingLimit -= tierProducts.length;
        remainingOffset = 0;
      }

      return {
        products: selectedProducts,
        totalCount: total,
      };
    },
    [curatedFilter, sortParam, supabase]
  );

  const fetchProducts = useCallback(async () => {
    const fetchId = fetchIdRef.current + 1;
    const startedAt =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    fetchIdRef.current = fetchId;
    setLoading(true);
    setLoadError("");

    const cleanSearch = sanitizeProductSearchTerm(queryParam);
    const from = (pageParam - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      if (curatedFilter) {
        const curatedResults = await fetchCuratedProducts({
          cleanSearch,
          from,
        });

        if (fetchId !== fetchIdRef.current) {
          return;
        }

        setProducts(curatedResults.products);
        setTotalCount(curatedResults.totalCount);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.warn("Curated shop filter failed; using category fallback.", error);
    }

    if (cleanSearch || sortParam === "price-low" || sortParam === "price-high") {
      try {
        const { products: searchResults, totalCount: searchCount } =
          await searchProductsWithFullText(supabase, {
            searchQuery: cleanSearch,
            category: categoryParam,
            sort: sortParam,
            limit: PAGE_SIZE,
            offset: from,
          });

        if (searchResults.length === 0 && pageParam > 1) {
          const { totalCount: firstPageSearchCount } =
            await searchProductsWithFullText(supabase, {
              searchQuery: cleanSearch,
              category: categoryParam,
              sort: sortParam,
              limit: 1,
              offset: 0,
            });

          if (fetchId !== fetchIdRef.current) {
            return;
          }

          setProducts([]);
          setTotalCount(firstPageSearchCount);
          setLoading(false);
          return;
        }

        if (fetchId !== fetchIdRef.current) {
          return;
        }

        setProducts(searchResults);
        setTotalCount(searchCount);
        setLoading(false);
        return;
      } catch (error) {
        console.warn("Shop RPC query failed; using fallback.", error);
      }
    }

    try {
      let query = supabase
        .from("products")
        .select(PRODUCT_LIST_FIELDS, {
          count: "exact",
        });

      if (categoryParam !== "All") {
        query = query.eq("category", categoryParam);
      }

      query = applyProductSearchFilter(query, cleanSearch);

      query = applyProductSort(query, sortParam);

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw error;
      }

      if (fetchId !== fetchIdRef.current) {
        return;
      }

      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      if (fetchId !== fetchIdRef.current) {
        return;
      }

      console.error("Shop product load failed.", error);
      setProducts([]);
      setTotalCount(0);
      setLoadError(
        error?.message ||
          "Products could not be loaded. Please check your connection and try again."
      );
    } finally {
      if (fetchId === fetchIdRef.current) {
        const endedAt =
          typeof performance !== "undefined" ? performance.now() : Date.now();
        console.info("[shop products] load completed", {
          fetchId,
          page: pageParam,
          category: categoryParam,
          hasSearch: Boolean(cleanSearch),
          sort: sortParam,
          durationMs: Math.round(endedAt - startedAt),
        });
        setLoading(false);
      }
    }
  }, [
    categoryParam,
    curatedFilter,
    fetchCuratedProducts,
    pageParam,
    queryParam,
    sortParam,
    supabase,
  ]);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, retryKey]);

  useEffect(() => {
    if (loading || totalCount === 0 || pageParam <= totalPages) {
      return;
    }

    updateShopParams({ page: totalPages });
  }, [loading, pageParam, totalCount, totalPages, updateShopParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const cleanSearch = sanitizeProductSearchTerm(searchTerm);

      if (cleanSearch === queryParam) {
        return;
      }

      updateShopParams({
        search: cleanSearch,
        page: "1",
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [queryParam, searchTerm, updateShopParams]);

  return (
    <>
      <Navbar />

      <section className="shop-page-section">
        <div className="container">
          <div className="shop-page-heading">
            <h1 className="fw-bold">Shop Curated Decor</h1>

            <p className="text-muted">
              Curated decor pieces to make every corner feel beautifully styled.
            </p>
          </div>

          <section className="shop-control-panel" aria-label="Shop controls">
            <div className="shop-primary-controls">
              <div className="shop-search-control">
                <label htmlFor="shop-search" className="visually-hidden">
                  Search products
                </label>

                <input
                  id="shop-search"
                  type="search"
                  className="shop-search-input"
                  placeholder="Search decor pieces"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className="shop-filter-toggle"
                aria-expanded={filterOpen}
                aria-controls="shop-filter-options"
              >
                Filter & Sort
              </button>

              <div className="shop-sort-control">
                <label htmlFor="shop-sort" className="visually-hidden">
                  Sort products
                </label>

                <select
                  id="shop-sort"
                  className="shop-sort-select"
                  value={sortParam}
                  onChange={(event) =>
                    updateShopParams({
                      sort: event.target.value,
                      page: "1",
                    })
                  }
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div
              id="shop-filter-options"
              className={`shop-filter-options ${filterOpen ? "open" : ""}`}
            >
              <div className="shop-compact-select-row">
                <div className="shop-mobile-sort-control">
                  <label htmlFor="shop-mobile-sort">Sort</label>

                  <select
                    id="shop-mobile-sort"
                    className="shop-sort-select"
                    value={sortParam}
                    onChange={(event) =>
                      updateShopParams({
                        sort: event.target.value,
                        page: "1",
                      })
                    }
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                <div className="shop-category-control">
                  <label htmlFor="shop-category">Browse</label>

                  <select
                    id="shop-category"
                    className="shop-category-select"
                    value={categoryParam}
                    onChange={(event) =>
                      updateShopParams({
                        category: event.target.value,
                        space: "",
                        collection: "",
                        page: "1",
                      })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters && (
                  <Link href="/shop" className="shop-clear-button">
                    Clear filters
                  </Link>
                )}
              </div>

              <div className="shop-chip-group" aria-label="Shop by space">
                <span className="shop-chip-label">Spaces</span>

                <div className="shop-chip-row">
                  {shopSpaces.map((space) => (
                    <Link
                      key={space.label}
                      href={getCuratedFilterHref("space", space.slug)}
                      className={`shop-space-chip ${
                        spaceParam === space.slug ? "active" : ""
                      }`}
                    >
                      {space.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="shop-chip-group" aria-label="Styled collections">
                <span className="shop-chip-label">Collections</span>

                <div className="shop-chip-row">
                  {styledCollections.map((collection) => (
                    <Link
                      key={collection.title}
                      href={getCuratedFilterHref("collection", collection.slug)}
                      className={`shop-collection-chip ${
                        collectionParam === collection.slug ? "active" : ""
                      }`}
                      title={collection.text}
                    >
                      {collection.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {activeFilterLabels.length > 0 && (
              <div className="shop-active-filters" aria-label="Active filters">
                {activeFilterLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            )}
          </section>

          {!loading && (
            <div className="shop-results-meta">
              <p className="text-muted mb-0">
                Showing {showingStart}-{showingEnd} of {totalCount} product
                {totalCount === 1 ? "" : "s"}
              </p>

              {hasActiveFilters && (
                <Link href="/shop" className="shop-reset-link">
                  View All Products
                </Link>
              )}
            </div>
          )}

          {loading && (
            <div className="row g-3 g-lg-4 shop-product-grid">
              {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
                <ProductSkeleton
                  key={item}
                  columnClassName="col-6 col-md-4 col-xl-3"
                />
              ))}
            </div>
          )}

          {!loading && loadError && (
            <div className="empty-state text-center" role="alert">
              <div className="empty-state-icon">!</div>

              <h4 className="fw-bold mb-2">Products could not load</h4>

              <p className="text-muted mb-4">{loadError}</p>

              <button
                type="button"
                className="btn btn-dark"
                onClick={() => setRetryKey((key) => key + 1)}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !loadError && products.length === 0 && (
            <EmptyState
              title="No products found"
              message="Try another search term, category, or sorting option."
              actionText="View All Products"
              actionHref="/shop"
            />
          )}

          {!loading && !loadError && products.length > 0 && (
            <>
              <div className="row g-3 g-lg-4 shop-product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    columnClassName="col-6 col-md-4 col-xl-3"
                    id={product.id}
                    image={product.image_url}
                    thumbnailImage={
                      product.thumbnailImage ||
                      product.thumbnailUrl ||
                      product.thumbnail_url ||
                      product.thumbnail_image
                    }
                    title={product.title}
                    description={product.description}
                    price={product.price}
                    category={product.category}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="shop-pagination">
                  <button
                    type="button"
                    className="btn btn-outline-dark px-4"
                    disabled={pageParam <= 1}
                    onClick={() =>
                      updateShopParams({ page: String(pageParam - 1) })
                    }
                  >
                    Previous
                  </button>

                  <span>
                    Page {pageParam} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="btn btn-outline-dark px-4"
                    disabled={pageParam >= totalPages}
                    onClick={() =>
                      updateShopParams({ page: String(pageParam + 1) })
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <section className="shop-page-section">
            <div className="container">
              <div className="row g-3 g-lg-4 shop-product-grid">
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (item) => (
                    <ProductSkeleton
                      key={item}
                      columnClassName="col-6 col-md-4 col-xl-3"
                    />
                  )
                )}
              </div>
            </div>
          </section>
          <Footer />
        </>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
