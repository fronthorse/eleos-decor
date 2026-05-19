"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "../../lib/supabase/client";
import { isAdminEmail } from "../../lib/adminAuth";
import { getSessionSafely } from "../../lib/supabase/auth";
import {
  formatOrderStatus,
  getOrderStatusDescription,
  normalizeOrderStatus,
  ORDER_STATUSES,
} from "../../lib/orderStatuses";
import {
  getProductPreviewImageSrc,
  PRODUCT_IMAGE_FALLBACK,
} from "../../lib/productImages";
import {
  getCartVariantLabel,
  supportsPrintVariants,
} from "../../lib/productVariants";
import imageCompression from "browser-image-compression";

const PRODUCT_PAGE_SIZE = 12;
const INQUIRY_PAGE_SIZE = 10;
const ADMIN_PRODUCT_LIST_FIELDS =
  "id,title,category,price,description,image_url,gallery_images,created_at";

const REVENUE_STATUS_VALUES = ["paid", "processing", "delivered"];

function handlePreviewImageError(event) {
  if (event.currentTarget.src.includes(PRODUCT_IMAGE_FALLBACK)) {
    return;
  }

  event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
}

function createSafeFileName(fileName) {
  return `${Date.now()}-${fileName.replaceAll(" ", "-")}`;
}

function getPositivePage(value) {
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function getPaginationRange(page, pageSize) {
  const safePage = getPositivePage(page);
  const from = (safePage - 1) * pageSize;

  return {
    from,
    to: from + pageSize - 1,
  };
}

function createVariantDraft(label = "") {
  return {
    clientId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    variant_label: label,
    price_override: "",
    sku: "",
    is_default: false,
    imageFiles: [],
    galleryFiles: [],
  };
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [productVariantCounts, setProductVariantCounts] = useState({});
  const [productsLoading, setProductsLoading] = useState(true);
  const [productPage, setProductPage] = useState(1);
  const [productCount, setProductCount] = useState(0);
  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryCount, setInquiryCount] = useState(0);

  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalReviews: 0,
    averageRating: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    contactedInquiries: 0,
    paymentPendingInquiries: 0,
    processingInquiries: 0,
    confirmedInquiries: 0,
    fulfilledInquiries: 0,
    cancelledInquiries: 0,
    estimatedRevenue: 0,
  });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Frames");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [variantDrafts, setVariantDrafts] = useState([
    createVariantDraft("Print A"),
  ]);
  const [existingVariants, setExistingVariants] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const productTotalPages = Math.max(
    1,
    Math.ceil(productCount / PRODUCT_PAGE_SIZE)
  );
  const inquiryTotalPages = Math.max(
    1,
    Math.ceil(inquiryCount / INQUIRY_PAGE_SIZE)
  );

  async function checkUserSession() {
    const { session, error } = await getSessionSafely(supabase);

    if (!session) {
      if (error) {
        toast.error("Your session expired. Please log in again.");
      }

      router.push("/admin/login");
      return;
    }

    if (!isAdminEmail(session.user.email)) {
      await supabase.auth.signOut();
      toast.error("You are not authorized to access the admin portal.");
      router.push("/customer/login");
      router.refresh();
      return;
    }

    setUser(session.user);
    setCheckingAuth(false);
  }

  useEffect(() => {
    checkUserSession();
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productPage, user]);

  useEffect(() => {
    if (!user) return;

    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiryPage, user]);

  useEffect(() => {
    if (!user) return;

    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (productPage > productTotalPages) {
      setProductPage(productTotalPages);
    }
  }, [productPage, productTotalPages]);

  useEffect(() => {
    if (inquiryPage > inquiryTotalPages) {
      setInquiryPage(inquiryTotalPages);
    }
  }, [inquiryPage, inquiryTotalPages]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  async function fetchProducts() {
    setProductsLoading(true);
    const { from, to } = getPaginationRange(productPage, PRODUCT_PAGE_SIZE);

    const { data, error, count } = await supabase
      .from("products")
      .select(ADMIN_PRODUCT_LIST_FIELDS, {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      toast.error(error.message);
      setProductsLoading(false);
      return;
    }

    setProducts(data || []);
    setProductCount(count || 0);

    const productIds = (data || []).map((product) => product.id);

    if (productIds.length === 0) {
      setProductVariantCounts({});
      setProductsLoading(false);
      return;
    }

    const { data: variants, error: variantError } = await supabase
      .from("product_variants")
      .select("product_id")
      .in("product_id", productIds);

    if (variantError) {
      setProductVariantCounts({});
      setProductsLoading(false);
      return;
    }

    setProductVariantCounts(
      (variants || []).reduce((counts, variant) => {
        counts[variant.product_id] = (counts[variant.product_id] || 0) + 1;
        return counts;
      }, {})
    );
    setProductsLoading(false);
  }

  async function fetchInquiries() {
    const { from, to } = getPaginationRange(inquiryPage, INQUIRY_PAGE_SIZE);

    const { data, error, count } = await supabase
      .from("checkout_inquiries")
      .select(
        "id,created_at,order_number,status,customer_name,customer_phone,customer_email,delivery_address,items,total_amount",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      toast.error(error.message);
      return;
    }

    setInquiries(data || []);
    setInquiryCount(count || 0);
  }

  async function fetchAnalytics() {
    const { data: rpcAnalytics, error: rpcError } = await supabase.rpc(
      "get_admin_analytics"
    );
    const rpcRow = Array.isArray(rpcAnalytics)
      ? rpcAnalytics[0]
      : rpcAnalytics;

    if (!rpcError && rpcRow) {
      setAnalytics({
        totalProducts: Number(rpcRow.total_products || 0),
        totalReviews: Number(rpcRow.total_reviews || 0),
        averageRating: Number(rpcRow.average_rating || 0).toFixed(1),
        totalInquiries: Number(rpcRow.total_inquiries || 0),
        pendingInquiries: Number(rpcRow.pending_inquiries || 0),
        contactedInquiries: Number(rpcRow.contacted_inquiries || 0),
        paymentPendingInquiries: Number(
          rpcRow.payment_pending_inquiries || 0
        ),
        processingInquiries: Number(rpcRow.processing_inquiries || 0),
        confirmedInquiries: Number(rpcRow.confirmed_inquiries || 0),
        fulfilledInquiries: Number(rpcRow.fulfilled_inquiries || 0),
        cancelledInquiries: Number(rpcRow.cancelled_inquiries || 0),
        estimatedRevenue: Number(rpcRow.estimated_revenue || 0),
      });
      return;
    }

    const countRows = async (table, applyFilters) => {
      let query = supabase.from(table).select("id", {
        count: "exact",
        head: true,
      });

      if (applyFilters) {
        query = applyFilters(query);
      }

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return count || 0;
    };

    try {
      const [
        totalProducts,
        totalInquiries,
        pendingInquiries,
        contactedInquiries,
        paymentPendingInquiries,
        processingInquiries,
        confirmedInquiries,
        fulfilledInquiries,
        cancelledInquiries,
        reviewsResult,
        revenueResult,
      ] = await Promise.all([
        countRows("products"),
        countRows("checkout_inquiries"),
        countRows("checkout_inquiries", (query) =>
          query.eq("status", "new")
        ),
        countRows("checkout_inquiries", (query) =>
          query.eq("status", "contacted")
        ),
        countRows("checkout_inquiries", (query) =>
          query.eq("status", "payment_pending")
        ),
        countRows("checkout_inquiries", (query) =>
          query.eq("status", "processing")
        ),
        countRows("checkout_inquiries", (query) =>
          query.eq("status", "paid")
        ),
        countRows("checkout_inquiries", (query) =>
          query.eq("status", "delivered")
        ),
        countRows("checkout_inquiries", (query) =>
          query.eq("status", "cancelled")
        ),
        supabase.from("reviews").select("rating", { count: "exact" }),
        supabase
          .from("checkout_inquiries")
          .select("total_amount")
          .in("status", REVENUE_STATUS_VALUES),
      ]);

      if (reviewsResult.error) {
        throw reviewsResult.error;
      }

      if (revenueResult.error) {
        throw revenueResult.error;
      }

      const reviewsData = reviewsResult.data || [];
      const totalReviews = reviewsResult.count || 0;
      const averageRating =
        totalReviews > 0
          ? (
              reviewsData.reduce(
                (sum, review) => sum + Number(review.rating || 0),
                0
              ) / totalReviews
            ).toFixed(1)
          : 0;

      const estimatedRevenue =
        revenueResult.data?.reduce(
          (sum, item) => sum + Number(item.total_amount || 0),
          0
        ) || 0;

      setAnalytics({
        totalProducts,
        totalReviews,
        averageRating,
        totalInquiries,
        pendingInquiries,
        contactedInquiries,
        paymentPendingInquiries,
        processingInquiries,
        confirmedInquiries,
        fulfilledInquiries,
        cancelledInquiries,
        estimatedRevenue,
      });
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function uploadImages(files) {
    const uploadedImageUrls = [];

    for (const file of files) {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });

      const safeFileName = createSafeFileName(compressedFile.name);

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(safeFileName, compressedFile);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: imageData } = supabase.storage
        .from("products")
        .getPublicUrl(safeFileName);

      uploadedImageUrls.push(imageData.publicUrl);
    }

    return uploadedImageUrls;
  }

  function updateVariantDraft(clientId, updates) {
    setVariantDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.clientId === clientId
          ? { ...draft, ...updates }
          : updates.is_default
          ? { ...draft, is_default: false }
          : draft
      )
    );
  }

  function addVariantDraft() {
    const nextLetter = String.fromCharCode(65 + variantDrafts.length);
    setVariantDrafts((currentDrafts) => [
      ...currentDrafts,
      createVariantDraft(`Print ${nextLetter}`),
    ]);
  }

  function removeVariantDraft(clientId) {
    setVariantDrafts((currentDrafts) =>
      currentDrafts.filter((draft) => draft.clientId !== clientId)
    );
  }

  async function saveProductVariants(productId) {
    if (!supportsPrintVariants(category)) {
      return;
    }

    const variantsToCreate = variantDrafts.filter(
      (variant) =>
        variant.variant_label.trim() &&
        variant.imageFiles &&
        variant.imageFiles.length > 0
    );

    if (variantsToCreate.length === 0) {
      return;
    }

    const variantRows = [];

    for (const variant of variantsToCreate) {
      const uploadedImages = await uploadImages([
        ...variant.imageFiles,
        ...variant.galleryFiles,
      ]);

      variantRows.push({
        product_id: productId,
        variant_label: variant.variant_label.trim(),
        variant_type: "print",
        image_url: uploadedImages[0],
        gallery: uploadedImages.slice(1),
        price_override: variant.price_override.trim() || null,
        sku: variant.sku.trim() || null,
        is_default:
          variant.is_default ||
          (existingVariants.length === 0 && variantRows.length === 0),
      });
    }

    const hasNewDefault = variantRows.some((variant) => variant.is_default);

    if (hasNewDefault) {
      const { error: defaultError } = await supabase
        .from("product_variants")
        .update({ is_default: false })
        .eq("product_id", productId);

      if (defaultError) {
        throw new Error(defaultError.message);
      }
    }

    const { error } = await supabase.from("product_variants").insert(variantRows);

    if (error) {
      throw new Error(error.message);
    }
  }

  async function handleDeleteVariant(variantId) {
    const confirmed = window.confirm("Delete this print variant?");

    if (!confirmed) return;

    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId);

    if (error) {
      toast.error(error.message);
      return;
    }

    setExistingVariants((variants) =>
      variants.filter((variant) => variant.id !== variantId)
    );
    toast.success("Variant deleted.");
  }

  function generateDescription() {
    if (!title || !category) {
      toast.error("Please enter product title and category first.");
      return;
    }

    const generatedText = `${title} is a beautiful ${category.toLowerCase()} piece carefully selected by Eleos Decor to bring warmth, elegance, and personality into your space. It is perfect for homes, offices, lounges, and stylish interiors that need a touch of comfort and class.`;

    setDescription(generatedText);
    toast.success("Description generated successfully.");
  }

  function resetForm() {
    setEditingProductId(null);
    setTitle("");
    setCategory("Frames");
    setPrice("");
    setDescription("");
    setImageFiles([]);
    setVariantDrafts([createVariantDraft("Print A")]);
    setExistingVariants([]);
  }

  async function fetchProductVariants(productId) {
    const { data, error } = await supabase
      .from("product_variants")
      .select(
        "id,product_id,variant_label,variant_type,image_url,gallery,price_override,sku,is_default"
      )
      .eq("product_id", productId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      toast.error(error.message);
      return [];
    }

    return data || [];
  }

  async function handleEditProduct(product) {
    setEditingProductId(product.id);
    setTitle(product.title || "");
    setCategory(product.category || "Frames");
    setPrice(product.price || "");
    setDescription(product.description || "");
    setImageFiles([]);
    setExistingVariants(
      supportsPrintVariants(product) ? await fetchProductVariants(product.id) : []
    );
    setVariantDrafts([createVariantDraft("Print A")]);
    setActiveTab("upload");
    toast.success("Editing product.");
  }

  async function handleDeleteProduct(product) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const imagesToDelete =
      product.gallery_images && product.gallery_images.length > 0
        ? product.gallery_images
        : [product.image_url];

    const filePaths = imagesToDelete
      .map((url) => url?.split("/products/")[1])
      .filter(Boolean);

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("products")
        .remove(filePaths);

      if (storageError) {
        toast.error(storageError.message);
        return;
      }
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Product deleted successfully.");
    fetchProducts();
    fetchAnalytics();
  }

  async function handleUploadProduct(e) {
    e.preventDefault();

    if (isSavingProduct) {
      return;
    }

    setIsSavingProduct(true);

    try {
      if (editingProductId) {
        const updatedProduct = {
          title,
          category,
          price,
          description,
        };

        if (imageFiles.length > 0) {
          const uploadedImageUrls = await uploadImages(imageFiles);
          updatedProduct.image_url = uploadedImageUrls[0];
          updatedProduct.gallery_images = uploadedImageUrls;
        }

        const { error } = await supabase
          .from("products")
          .update(updatedProduct)
          .eq("id", editingProductId);

        if (error) {
          toast.error(error.message);
          return;
        }

        await saveProductVariants(editingProductId);
        resetForm();
        toast.success("Product updated successfully.");
        fetchProducts();
        fetchAnalytics();
        setActiveTab("products");
        return;
      }

      if (!imageFiles || imageFiles.length === 0) {
        toast.error("Please select at least one product image.");
        return;
      }

      const uploadedImageUrls = await uploadImages(imageFiles);

      const { data: insertedProduct, error } = await supabase
        .from("products")
        .insert([
          {
            title,
            category,
            price,
            description,
            image_url: uploadedImageUrls[0],
            gallery_images: uploadedImageUrls,
          },
        ])
        .select("id")
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }

      await saveProductVariants(insertedProduct.id);
      resetForm();
      toast.success("Product uploaded successfully.");
      fetchProducts();
      fetchAnalytics();
      setActiveTab("products");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleUpdateInquiryStatus(id, newStatus) {
    const { error } = await supabase
      .from("checkout_inquiries")
      .update({ status: normalizeOrderStatus(newStatus) })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Order status updated.");
    fetchInquiries();
    fetchAnalytics();
  }

  function formatPhoneForWhatsApp(phone) {
    if (!phone) return "";

    const cleaned = String(phone).replace(/\D/g, "");

    if (cleaned.startsWith("234")) return cleaned;
    if (cleaned.startsWith("0")) return `234${cleaned.slice(1)}`;

    return cleaned;
  }

  if (checkingAuth) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold">Checking admin access...</h4>
        <p className="text-muted">Please wait.</p>
      </div>
    );
  }

  return (
    <div className="admin-shell py-5" style={{ marginTop: "80px" }}>
      <div className="container">
        <div className="admin-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold">Admin Dashboard</h1>
            <p className="text-muted mb-0">Logged in as {user?.email}</p>
          </div>

          <button onClick={handleLogout} className="btn btn-outline-dark">
            Logout
          </button>
        </div>

        <div className="admin-tabs mb-5">
          {[
            { key: "overview", label: "Overview" },
            { key: "products", label: "Products" },
            { key: "upload", label: "Upload / Edit" },
            { key: "inquiries", label: "Orders" },
            { key: "analytics", label: "Analytics" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="soft-card p-4 text-center">
                  <h2 className="fw-bold gold-text">
                    {analytics.totalProducts}
                  </h2>
                  <p className="text-muted mb-0">Total Products</p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="soft-card p-4 text-center">
                  <h2 className="fw-bold gold-text">
                    {analytics.totalInquiries}
                  </h2>
                  <p className="text-muted mb-0">Total Orders</p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="soft-card p-4 text-center">
                  <h2 className="fw-bold gold-text">
                    {analytics.totalReviews}
                  </h2>
                  <p className="text-muted mb-0">Total Reviews</p>
                </div>
              </div>
            </div>

            <div className="soft-card p-4">
              <h4 className="fw-bold mb-3">Quick Summary</h4>
              <p className="text-muted mb-1">
                New orders: <strong>{analytics.pendingInquiries}</strong>
              </p>
              <p className="text-muted mb-1">
                Payment pending:{" "}
                <strong>{analytics.paymentPendingInquiries}</strong>
              </p>
              <p className="text-muted mb-1">
                Paid orders: <strong>{analytics.confirmedInquiries}</strong>
              </p>
              <p className="text-muted mb-0">
                Average rating: <strong>{analytics.averageRating}</strong>
              </p>
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div>
            <h4 className="fw-bold mb-4">Business Analytics</h4>

            <div className="row g-4">
              <div className="col-md-4">
                <div className="admin-metric-card text-center">
                  <h2 className="fw-bold gold-text">
                    {analytics.totalInquiries}
                  </h2>
                  <p className="text-muted mb-0">Total Orders</p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="admin-metric-card text-center">
                  <h2 className="fw-bold gold-text">
                    {analytics.confirmedInquiries}
                  </h2>
                  <p className="text-muted mb-0">Paid Orders</p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="admin-metric-card text-center">
                  <h2 className="fw-bold gold-text">
                    ₦{analytics.estimatedRevenue.toLocaleString()}
                  </h2>
                  <p className="text-muted mb-0">Estimated Revenue</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="admin-metric-card text-center">
                  <h3 className="fw-bold">{analytics.pendingInquiries}</h3>
                  <p className="text-muted mb-0">New</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="admin-metric-card text-center">
                  <h3 className="fw-bold">{analytics.contactedInquiries}</h3>
                  <p className="text-muted mb-0">Contacted</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="admin-metric-card text-center">
                  <h3 className="fw-bold">
                    {analytics.paymentPendingInquiries}
                  </h3>
                  <p className="text-muted mb-0">Payment Pending</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="admin-metric-card text-center">
                  <h3 className="fw-bold">{analytics.processingInquiries}</h3>
                  <p className="text-muted mb-0">Processing</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="admin-metric-card text-center">
                  <h3 className="fw-bold">{analytics.confirmedInquiries}</h3>
                  <p className="text-muted mb-0">Paid</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="admin-metric-card text-center">
                  <h3 className="fw-bold">{analytics.fulfilledInquiries}</h3>
                  <p className="text-muted mb-0">Delivered</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="admin-metric-card text-center">
                  <h3 className="fw-bold">{analytics.cancelledInquiries}</h3>
                  <p className="text-muted mb-0">Cancelled</p>
                </div>
              </div>

              <div className="col-md-3">
                <div className="admin-metric-card text-center">
                  <h3 className="fw-bold">{analytics.totalProducts}</h3>
                  <p className="text-muted mb-0">Products</p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="admin-metric-card text-center">
                  <h3 className="fw-bold">{analytics.totalReviews}</h3>
                  <p className="text-muted mb-0">Total Reviews</p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="admin-metric-card text-center">
                  <h3 className="fw-bold">{analytics.averageRating}</h3>
                  <p className="text-muted mb-0">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <form
            onSubmit={handleUploadProduct}
            className="admin-product-form"
          >
            <div className="admin-form-header">
              <div>
                <p className="section-label mb-1">Product Management</p>
                <h4 className="fw-bold mb-0">
                  {editingProductId ? "Edit Product" : "Upload New Product"}
                </h4>
              </div>

              {editingProductId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline-dark btn-sm"
                  disabled={isSavingProduct}
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="admin-form-section">
              <div className="admin-form-section-heading">
                <h5>Basic Info</h5>
                <span>Customer-facing product details</span>
              </div>

              <div className="mb-3">
                <label className="form-label">Product Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-0">
                <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                  <label className="form-label mb-0">Description</label>

                <button
                  type="button"
                  onClick={generateDescription}
                  className="btn btn-sm btn-outline-dark"
                >
                  Generate Description
                </button>
              </div>

              <textarea
                className="form-control"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            </div>

            <div className="admin-form-section">
              <div className="admin-form-section-heading">
                <h5>Pricing & Category</h5>
                <span>Controls shop filtering and display price</span>
              </div>

              <div className="row g-3">
                <div className="col-md-7">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option>Frames</option>
                    <option>Mirrors</option>
                    <option>Wall Clocks</option>
                    <option>Wall Art</option>
                    <option>Rugs</option>
                    <option>Throw Pillows</option>
                    <option>Throw Blankets</option>
                    <option>Bedsheets</option>
                    <option>Tables</option>
                    <option>Chairs</option>
                    <option>Dining Sets</option>
                    <option>Ornaments</option>
                    <option>Figurines</option>
                    <option>Faux Books</option>
                    <option>Lighting</option>
                    <option>Diffusers</option>
                    <option>Humidifiers</option>
                    <option>Scented Candles</option>
                    <option>Plants</option>
                    <option>Flowers</option>
                    <option>Artificial Water Fountains</option>
                  </select>
                </div>

                <div className="col-md-5">
                  <label className="form-label">Price</label>
                  <input
                    type="text"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="admin-form-section">
              <div className="admin-form-section-heading">
                <h5>Images</h5>
                <span>First image becomes the main product image</span>
              </div>

              <label className="form-label">
                {editingProductId
                  ? "Replace Product Images (Optional)"
                  : "Product Images"}
              </label>

              <input
                type="file"
                className="form-control"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files))}
                required={!editingProductId}
                disabled={isSavingProduct}
              />
            </div>

            {supportsPrintVariants(category) && (
              <div className="admin-form-section admin-variant-panel">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-1">Frame Print Variants</h5>
                    <p className="text-muted small mb-0">
                      Add Print A / Print B / Print C options under this one
                      frame product.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addVariantDraft}
                    className="btn btn-sm btn-outline-dark"
                    disabled={isSavingProduct}
                  >
                    Add Print
                  </button>
                </div>

                {existingVariants.length > 0 && (
                  <div className="admin-existing-variants mb-3">
                    {existingVariants.map((variant) => (
                      <div className="admin-existing-variant" key={variant.id}>
                        <img
                          src={getProductPreviewImageSrc(variant)}
                          alt={variant.variant_label}
                          loading="lazy"
                          onError={handlePreviewImageError}
                        />

                        <div>
                          <strong>{variant.variant_label}</strong>
                          <p className="text-muted small mb-0">
                            {variant.is_default ? "Default print" : "Print"}
                            {variant.price_override
                              ? ` · ₦${variant.price_override}`
                              : ""}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="btn btn-sm btn-outline-danger"
                          disabled={isSavingProduct}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {variantDrafts.map((variant, index) => (
                  <div className="admin-variant-draft" key={variant.clientId}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Variant Label</label>
                        <input
                          className="form-control"
                          value={variant.variant_label}
                          onChange={(e) =>
                            updateVariantDraft(variant.clientId, {
                              variant_label: e.target.value,
                            })
                          }
                          placeholder={`Print ${String.fromCharCode(65 + index)}`}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Price Override (Optional)
                        </label>
                        <input
                          className="form-control"
                          value={variant.price_override}
                          onChange={(e) =>
                            updateVariantDraft(variant.clientId, {
                              price_override: e.target.value,
                            })
                          }
                          placeholder="Leave blank to use product price"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Variant Image</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) =>
                            updateVariantDraft(variant.clientId, {
                              imageFiles: Array.from(e.target.files),
                            })
                          }
                          disabled={isSavingProduct}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Variant Gallery (Optional)
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            updateVariantDraft(variant.clientId, {
                              galleryFiles: Array.from(e.target.files),
                            })
                          }
                          disabled={isSavingProduct}
                        />
                      </div>

                      <div className="col-md-8">
                        <label className="form-label">SKU (Optional)</label>
                        <input
                          className="form-control"
                          value={variant.sku}
                          onChange={(e) =>
                            updateVariantDraft(variant.clientId, {
                              sku: e.target.value,
                            })
                          }
                          placeholder="Internal reference"
                        />
                      </div>

                      <div className="col-md-4 d-flex align-items-end">
                        <label className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={variant.is_default}
                            onChange={(e) =>
                              updateVariantDraft(variant.clientId, {
                                is_default: e.target.checked,
                              })
                            }
                          />
                          <span className="form-check-label">
                            Default print
                          </span>
                        </label>
                      </div>
                    </div>

                    {variantDrafts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariantDraft(variant.clientId)}
                        className="btn btn-sm btn-outline-danger mt-3"
                        disabled={isSavingProduct}
                      >
                        Remove Print Row
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="admin-form-actions">
              <button className="btn btn-dark" disabled={isSavingProduct}>
                {isSavingProduct
                  ? editingProductId
                    ? "Saving changes..."
                    : "Uploading product..."
                  : editingProductId
                  ? "Save Changes"
                  : "Upload Product"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "inquiries" && (
          <div>
            <h4 className="fw-bold mb-4">Orders</h4>
            <div className="assisted-commerce-note mb-4">
              <h6 className="fw-bold mb-2">WhatsApp-assisted workflow</h6>
              <p className="text-muted mb-0">
                Orders begin as requests. Move each order through the canonical
                stages as WhatsApp confirmation, payment, and delivery progress.
              </p>
            </div>

            {inquiries.length === 0 ? (
              <p className="text-muted">No orders yet.</p>
            ) : (
              <>
              <p className="text-muted mb-4">
                Showing page {inquiryPage} of {inquiryTotalPages} (
                {inquiryCount} order{inquiryCount === 1 ? "" : "s"})
              </p>

              <div className="row g-4">
                {inquiries.map((inquiry) => {
                  const customerName = inquiry.customer_name || "";
                  const customerPhone = inquiry.customer_phone || "";
                  const whatsappPhone = formatPhoneForWhatsApp(customerPhone);

                  const whatsappMessage = `Hello ${customerName}, thank you for your order with Eleos Decor.

Order ID: ${inquiry.order_number || `Inquiry #${inquiry.id}`}
Status: ${formatOrderStatus(inquiry.status)}

We are contacting you regarding your order.`;

                  return (
                    <div className="col-lg-6" key={inquiry.id}>
                      <div className="soft-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="fw-bold mb-1">
                              Order ID:{" "}
                              {inquiry.order_number || `Inquiry #${inquiry.id}`}
                            </h6>

                            <p className="text-muted small mb-0">
                              {new Date(inquiry.created_at).toLocaleString()}
                            </p>
                          </div>

                          <span
                            className={`status-badge status-${normalizeOrderStatus(
                              inquiry.status
                            )}`}
                          >
                            {formatOrderStatus(inquiry.status)}
                          </span>
                        </div>

                        <p className="order-workflow-description">
                          {getOrderStatusDescription(inquiry.status)}
                        </p>

                        <div className="mb-3">
                          <p>
                            <strong>Name:</strong>{" "}
                            {customerName || "Not provided"}
                          </p>

                          <p>
                            <strong>Phone:</strong>{" "}
                            {customerPhone || "Not provided"}
                          </p>

                          <p>
                            <strong>Email:</strong>{" "}
                            {inquiry.customer_email || "Not provided"}
                          </p>

                          <p>
                            <strong>Address:</strong>{" "}
                            {inquiry.delivery_address || "Not provided"}
                          </p>
                        </div>

                        <div className="mb-3">
                          <h6 className="fw-bold">Items</h6>

                          {inquiry.items?.map((item, index) => {
                            const variantLabel = getCartVariantLabel(item);

                            return (
                            <div
                              key={index}
                              className="d-flex justify-content-between border-bottom py-2"
                            >
                              <span>
                                {item.title} × {item.quantity}
                                {variantLabel && (
                                  <small className="d-block text-muted">
                                    Print: {variantLabel}
                                  </small>
                                )}
                              </span>

                              <span>₦{item.price}</span>
                            </div>
                            );
                          })}
                        </div>

                        <div className="d-flex justify-content-between fw-bold mb-3">
                          <span>Total</span>
                          <span>
                            ₦
                            {Number(
                              inquiry.total_amount || 0
                            ).toLocaleString()}
                          </span>
                        </div>

                        <label className="form-label">Update Status</label>

                        <select
                          className="form-select"
                          value={normalizeOrderStatus(inquiry.status)}
                          onChange={(e) =>
                            handleUpdateInquiryStatus(
                              inquiry.id,
                              e.target.value
                            )
                          }
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option value={status} key={status}>
                              {formatOrderStatus(status)} -{" "}
                              {getOrderStatusDescription(status)}
                            </option>
                          ))}
                        </select>

                        {whatsappPhone && (
                          <a
                            href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                              whatsappMessage
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success w-100 mt-3"
                          >
                            Message Customer on WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {inquiryTotalPages > 1 && (
                <div className="shop-pagination">
                  <button
                    type="button"
                    className="btn btn-outline-dark px-4"
                    disabled={inquiryPage <= 1}
                    onClick={() =>
                      setInquiryPage((page) => Math.max(1, page - 1))
                    }
                  >
                    Previous
                  </button>

                  <span>
                    Page {inquiryPage} of {inquiryTotalPages}
                  </span>

                  <button
                    type="button"
                    className="btn btn-outline-dark px-4"
                    disabled={inquiryPage >= inquiryTotalPages}
                    onClick={() =>
                      setInquiryPage((page) =>
                        Math.min(inquiryTotalPages, page + 1)
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              )}
              </>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div className="admin-products-panel">
            <div className="admin-list-header">
              <div>
                <h4 className="fw-bold mb-1">Uploaded Products</h4>

                <p className="text-muted mb-0">
              Page {productPage} of {productTotalPages} · {productCount}{" "}
              product{productCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="admin-product-grid">
              {productsLoading &&
                Array.from({ length: PRODUCT_PAGE_SIZE }, (_, index) => (
                  <article
                    className="admin-product-card admin-product-card-skeleton"
                    key={index}
                  >
                    <div className="admin-product-thumb skeleton" />

                    <div className="admin-product-content">
                      <div className="skeleton skeleton-title" />
                      <div className="skeleton skeleton-button" />
                    </div>
                  </article>
                ))}

              {!productsLoading && products.map((product) => {
                const imageCount = product.gallery_images?.length || 1;
                const variantCount = productVariantCounts[product.id] || 0;

                return (
                <article className="admin-product-card" key={product.id}>
                  <div className="admin-product-thumb">
                    <img
                      src={getProductPreviewImageSrc(product)}
                      alt={product.title}
                      loading="lazy"
                      onError={handlePreviewImageError}
                    />
                  </div>

                    <div className="admin-product-content">
                      <div className="admin-product-title-row">
                        <h5>{product.title}</h5>
                        <strong>₦{product.price}</strong>
                      </div>
                      <p className="admin-product-category">{product.category}</p>
                      <p className="admin-product-description">
                        {product.description}
                      </p>

                      <div className="admin-product-meta">
                        <span>
                          {imageCount} image{imageCount === 1 ? "" : "s"}
                        </span>
                        <span>
                          {variantCount} variant{variantCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                      <div className="admin-product-actions">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="btn btn-sm btn-outline-dark"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          Delete
                        </button>
                      </div>
                </article>
                );
              })}

              {!productsLoading && products.length === 0 && (
                <p className="text-muted">No products uploaded yet.</p>
              )}
            </div>

            {!productsLoading && productTotalPages > 1 && (
              <div className="shop-pagination">
                <button
                  type="button"
                  className="btn btn-outline-dark px-4"
                  disabled={productPage <= 1}
                  onClick={() =>
                    setProductPage((page) => Math.max(1, page - 1))
                  }
                >
                  Previous
                </button>

                <span>
                  Page {productPage} of {productTotalPages}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-dark px-4"
                  disabled={productPage >= productTotalPages}
                  onClick={() =>
                    setProductPage((page) =>
                      Math.min(productTotalPages, page + 1)
                    )
                  }
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
