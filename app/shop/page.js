"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
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

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 450;

function getPositivePage(value) {
  const page = Number.parseInt(value || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function ShopContent() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category") || "All";
  const queryParam =
    searchParams.get("search") || searchParams.get("query") || "";
  const sortParam = searchParams.get("sort") || "newest";
  const pageParam = getPositivePage(searchParams.get("page"));

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
    "Diffusers",
    "Humidifiers",
    "Scented Candles",
    "Plants",
    "Flowers",
    "Artificial Water Fountains",
  ];

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

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    const cleanSearch = sanitizeProductSearchTerm(queryParam);
    const from = (pageParam - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    if (cleanSearch) {
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

          setProducts([]);
          setTotalCount(firstPageSearchCount);
          setLoading(false);
          return;
        }

        setProducts(searchResults);
        setTotalCount(searchCount);
        setLoading(false);
        return;
      } catch (error) {
        console.warn("Full-text shop search failed; using fallback.", error);
      }
    }

    let query = supabase
      .from("products")
      .select("*", {
        count: "exact",
      });

    if (categoryParam !== "All") {
      query = query.eq("category", categoryParam);
    }

    query = applyProductSearchFilter(query, cleanSearch);

    if (sortParam === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (sortParam === "price-low") {
      query = query.order("price", { ascending: true });
    } else if (sortParam === "price-high") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.log(error);
      setProducts([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [categoryParam, pageParam, queryParam, sortParam, supabase]);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
          <div className="text-center shop-page-heading">
            <h1 className="fw-bold">Shop Eleos Decor</h1>

            <p className="text-muted">
              Explore elegant decor pieces for beautiful living spaces.
            </p>
          </div>

          <div className="d-md-none mb-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="btn btn-dark w-100"
            >
              {filterOpen ? "Hide Search & Filter" : "Search & Filter"}
            </button>
          </div>

          <div className={`shop-mobile-filter ${filterOpen ? "open" : ""}`}>
            <div className="row g-3 align-items-center mb-4">
              <div className="col-md-8">
                <label className="form-label fw-bold small mb-1 d-md-none">
                  Search
                </label>

                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold small mb-1 d-md-none">
                  Sort
                </label>

                <select
                  className="form-select form-select-lg"
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

            <div className="shop-filter-card mb-5">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small mb-1">
                    Category
                  </label>

                  <select
                    className="form-select"
                    value={categoryParam}
                    onChange={(event) =>
                      updateShopParams({
                        category: event.target.value,
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

                <div className="col-md-6 d-none d-md-block">
                  <label className="form-label fw-bold small mb-1">
                    Showing
                  </label>

                  <div className="bg-white border rounded-pill px-4 py-2 small">
                    {categoryParam === "All" ? "All categories" : categoryParam}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!loading && (
            <p className="text-muted mb-4">
              Showing {showingStart}-{showingEnd} of {totalCount} product
              {totalCount === 1 ? "" : "s"}
            </p>
          )}

          {loading && (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <ProductSkeleton key={item} />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <EmptyState
              title="No products found"
              message="Try another search term, category, or sorting option."
              actionText="View All Products"
              actionHref="/shop"
            />
          )}

          {!loading && products.length > 0 && (
            <>
              <div className="row g-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
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
    <Suspense fallback={<p className="text-center py-5">Loading shop...</p>}>
      <ShopContent />
    </Suspense>
  );
}
