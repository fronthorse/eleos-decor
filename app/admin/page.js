"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "../../lib/supabase/client";
import { isAdminEmail } from "../../lib/adminAuth";
import imageCompression from "browser-image-compression";

function createSafeFileName(fileName) {
  return `${Date.now()}-${fileName.replaceAll(" ", "-")}`;
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);

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
  const [editingProductId, setEditingProductId] = useState(null);

  async function checkUserSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
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
    fetchProducts();
    fetchAnalytics();
    fetchInquiries();
    setCheckingAuth(false);
  }

  useEffect(() => {
    checkUserSession();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }

    setProducts(data || []);
  }

  async function fetchInquiries() {
    const { data, error } = await supabase
      .from("checkout_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }

    setInquiries(data || []);
  }

  async function fetchAnalytics() {
    const { data: productsData } = await supabase.from("products").select("*");
    const { data: reviewsData } = await supabase.from("reviews").select("*");

    const { data: inquiriesData } = await supabase
      .from("checkout_inquiries")
      .select("*");

    const totalProducts = productsData?.length || 0;
    const totalReviews = reviewsData?.length || 0;
    const totalInquiries = inquiriesData?.length || 0;

    const averageRating =
      totalReviews > 0
        ? (
            reviewsData.reduce(
              (sum, review) => sum + Number(review.rating || 0),
              0
            ) / totalReviews
          ).toFixed(1)
        : 0;

    const pendingInquiries =
      inquiriesData?.filter((item) => item.status === "New").length || 0;

    const contactedInquiries =
      inquiriesData?.filter((item) => item.status === "Contacted").length || 0;

    const paymentPendingInquiries =
      inquiriesData?.filter((item) => item.status === "Payment Pending")
        .length || 0;

    const processingInquiries =
      inquiriesData?.filter((item) => item.status === "Processing").length || 0;

    const confirmedInquiries =
      inquiriesData?.filter((item) => item.status === "Paid").length || 0;

    const fulfilledInquiries =
      inquiriesData?.filter((item) => item.status === "Delivered").length || 0;

    const cancelledInquiries =
      inquiriesData?.filter((item) => item.status === "Cancelled").length || 0;

    const estimatedRevenue =
      inquiriesData
        ?.filter(
          (item) =>
            item.status === "Paid" ||
            item.status === "Processing" ||
            item.status === "Delivered"
        )
        .reduce((sum, item) => sum + Number(item.total_amount || 0), 0) || 0;

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
  }

  function handleEditProduct(product) {
    setEditingProductId(product.id);
    setTitle(product.title || "");
    setCategory(product.category || "Frames");
    setPrice(product.price || "");
    setDescription(product.description || "");
    setImageFiles([]);
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

      const { error } = await supabase.from("products").insert([
        {
          title,
          category,
          price,
          description,
          image_url: uploadedImageUrls[0],
          gallery_images: uploadedImageUrls,
        },
      ]);

      if (error) {
        toast.error(error.message);
        return;
      }

      resetForm();
      toast.success("Product uploaded successfully.");
      fetchProducts();
      fetchAnalytics();
      setActiveTab("products");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleUpdateInquiryStatus(id, newStatus) {
    const { error } = await supabase
      .from("checkout_inquiries")
      .update({ status: newStatus })
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
            className="bg-white p-4 rounded shadow-sm"
            style={{ maxWidth: "700px" }}
          >
            <h4 className="fw-bold mb-4">
              {editingProductId ? "Edit Product" : "Upload New Product"}
            </h4>

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

            <div className="mb-3">
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

            <div className="mb-3">
              <label className="form-label">Price</label>
              <input
                type="text"
                className="form-control"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
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

            <div className="mb-4">
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
              />

              <small className="text-muted d-block mt-2">
                Hold CTRL to select multiple images. The first image becomes the
                main product image.
              </small>
            </div>

            <button className="btn btn-dark w-100">
              {editingProductId ? "Save Changes" : "Upload Product"}
            </button>

            {editingProductId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline-dark w-100 mt-2"
              >
                Cancel Edit
              </button>
            )}
          </form>
        )}

        {activeTab === "inquiries" && (
          <div>
            <h4 className="fw-bold mb-4">Orders</h4>

            {inquiries.length === 0 ? (
              <p className="text-muted">No orders yet.</p>
            ) : (
              <div className="row g-4">
                {inquiries.map((inquiry) => {
                  const customerName =
                    inquiry.customer_name || inquiry.full_name || "";
                  const customerPhone =
                    inquiry.customer_phone || inquiry.phone || "";
                  const whatsappPhone = formatPhoneForWhatsApp(customerPhone);

                  const whatsappMessage = `Hello ${customerName}, thank you for your order with Eleos Decor.

Order ID: ${inquiry.order_number || `Inquiry #${inquiry.id}`}
Status: ${inquiry.status || "New"}

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
                            className={`status-badge status-${inquiry.status}`}
                          >
                            {inquiry.status}
                          </span>
                        </div>

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
                            {inquiry.customer_email ||
                              inquiry.email ||
                              "Not provided"}
                          </p>

                          <p>
                            <strong>Address:</strong>{" "}
                            {inquiry.delivery_address || "Not provided"}
                          </p>
                        </div>

                        <div className="mb-3">
                          <h6 className="fw-bold">Items</h6>

                          {inquiry.items?.map((item, index) => (
                            <div
                              key={index}
                              className="d-flex justify-content-between border-bottom py-2"
                            >
                              <span>
                                {item.title} × {item.quantity}
                              </span>

                              <span>₦{item.price}</span>
                            </div>
                          ))}
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
                          value={inquiry.status}
                          onChange={(e) =>
                            handleUpdateInquiryStatus(
                              inquiry.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Payment Pending">
                            Payment Pending
                          </option>
                          <option value="Paid">Paid</option>
                          <option value="Processing">Processing</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
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
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <h4 className="fw-bold mb-4">Uploaded Products</h4>

            <div className="row g-4">
              {products.map((product) => (
                <div className="col-md-4" key={product.id}>
                  <div className="card border-0 shadow-sm h-100">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      loading="lazy"
                      className="card-img-top"
                      style={{
                        height: "220px",
                        objectFit: "cover",
                      }}
                    />

                    <div className="card-body d-flex flex-column">
                      <h5 className="fw-bold">{product.title}</h5>
                      <p className="text-muted mb-1">{product.category}</p>
                      <p className="fw-bold">₦{product.price}</p>
                      <p className="text-muted small">{product.description}</p>

                      {product.gallery_images?.length > 0 && (
                        <p className="small text-muted">
                          {product.gallery_images.length} image
                          {product.gallery_images.length === 1 ? "" : "s"}{" "}
                          uploaded
                        </p>
                      )}

                      <div className="d-flex gap-2 mt-auto">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="btn btn-outline-dark w-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="btn btn-danger w-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <p className="text-muted">No products uploaded yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
