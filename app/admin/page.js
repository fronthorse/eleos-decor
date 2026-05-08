"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const supabase = createClient();
const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [message, setMessage] = useState("");

  const [products, setProducts] = useState([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Frames");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [analytics, setAnalytics] = useState({
  totalProducts: 0,
  totalReviews: 0,
  averageRating: 0,
  recentProducts: [],
});

  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    checkUserSession();
  }, []);

  async function checkUserSession() {
    const { data } = await supabase.auth.getSession();

    if (data.session?.user) {
      setUser(data.session.user);
      fetchProducts();
      fetchAnalytics();
    }

    setCheckingAuth(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("Logging in...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setUser(data.user);
    setCheckingAuth(false);
    setMessage("");
    fetchProducts();
    fetchAnalytics();
  }

  async function handleLogout() {
  await supabase.auth.signOut();

  setUser(null);
  setProducts([]);
  setCheckingAuth(false);

  router.push("/admin/login");
  router.refresh();
}

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts(data || []);
  }
async function fetchAnalytics() {
  const { data: productsData } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("*");

  const totalProducts = productsData?.length || 0;
  const totalReviews = reviewsData?.length || 0;

  const averageRating =
    totalReviews > 0
      ? (
          reviewsData.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        ).toFixed(1)
      : 0;

  setAnalytics({
    totalProducts,
    totalReviews,
    averageRating,
    recentProducts: productsData?.slice(0, 3) || [],
  });
}
  async function uploadImages(files) {
    const uploadedImageUrls = [];

    for (const file of files) {
      const safeFileName = `${Date.now()}-${file.name.replaceAll(" ", "-")}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(safeFileName, file);

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
    setMessage("Editing product. Update the details and save.");
  }

  function cancelEdit() {
    resetForm();
    setMessage("");
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
    .map((url) => url.split("/products/")[1])
    .filter(Boolean);

  if (filePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("products")
      .remove(filePaths);

    if (storageError) {
      setMessage(storageError.message);
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
function generateDescription() {
  if (!title || !category) {
    setMessage("Please enter product title and category first.");
    return;
  }

  const generatedText = `${title} is a beautiful ${category.toLowerCase()} piece carefully selected by Eleos Decor to bring warmth, elegance, and personality into your space. It is perfect for homes, offices, lounges, and stylish interiors that need a touch of comfort and class.`;

  setDescription(generatedText);
  setMessage("Description generated successfully.");
}
  async function handleUploadProduct(e) {
    e.preventDefault();

    try {
      if (editingProductId) {
        setMessage("Updating product...");

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
        return;
      }

      setMessage("Uploading product...");

      if (!imageFiles || imageFiles.length === 0) {
        setMessage("Please select at least one product image.");
        return;
      }

      const uploadedImageUrls = await uploadImages(imageFiles);

      const { error: insertError } = await supabase
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
        ]);

      if (insertError) {
        setMessage(insertError.message);
        return;
      }

      resetForm();
      toast.success("Product uploaded successfully.");
      fetchProducts();
      fetchAnalytics();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (checkingAuth) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold">Checking admin access...</h4>
        <p className="text-muted">Please wait.</p>
      </div>
    );
  }
if (!user) {
  return (
    <div className="container py-5 text-center">
      <h4 className="fw-bold">Loading admin dashboard...</h4>
      <p className="text-muted">Please wait.</p>
    </div>
  );
}

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Admin Dashboard</h1>
          <p className="text-muted mb-0">Logged in as {user.email}</p>
        </div>

        <button onClick={handleLogout} className="btn btn-outline-dark">
          Logout
        </button>
      </div>
<div className="row g-4 mb-5">
  <div className="col-md-4">
    <div className="soft-card p-4 text-center">
      <h2 className="fw-bold gold-text">{analytics.totalProducts}</h2>
      <p className="text-muted mb-0">Total Products</p>
    </div>
  </div>

  <div className="col-md-4">
    <div className="soft-card p-4 text-center">
      <h2 className="fw-bold gold-text">{analytics.totalReviews}</h2>
      <p className="text-muted mb-0">Total Reviews</p>
    </div>
  </div>

  <div className="col-md-4">
    <div className="soft-card p-4 text-center">
      <h2 className="fw-bold gold-text">{analytics.averageRating}</h2>
      <p className="text-muted mb-0">Average Rating</p>
    </div>
  </div>
</div>
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
            placeholder="e.g. Golden Wall Frame"
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
            <option>Plants</option>
            <option>Mirrors</option>
            <option>Diffusers</option>
            <option>Humidifiers</option>
            <option>Rugs</option>
            <option>Tables</option>
            <option>Dining Sets</option>
            <option>Flowers</option>
            <option>Figurines</option>
            <option>Faux Books</option>
            <option>Wall Clocks</option>
            <option>Ornaments</option>
            <option>Chairs</option>
            <option>Scented Candles</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>

          <input
            type="text"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 18,000"
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
            placeholder="Write a short product description..."
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
  Hold CTRL (Windows) or CMD (Mac) to select multiple images.
  The first selected image becomes the main product image.
</small>
        </div>

        <button className="btn btn-dark w-100">
          {editingProductId ? "Save Changes" : "Upload Product"}
        </button>

        {editingProductId && (
          <button
            type="button"
            onClick={cancelEdit}
            className="btn btn-outline-dark w-100 mt-2"
          >
            Cancel Edit
          </button>
        )}

        {message && <p className="mt-3 text-muted">{message}</p>}
      </form>

      <div className="mt-5">
        <h4 className="fw-bold mb-4">Uploaded Products</h4>

        <div className="row g-4">
          {products.map((product) => (
            <div className="col-md-4" key={product.id}>
              <div className="card border-0 shadow-sm h-100">
                <img
                  src={product.image_url}
                  alt={product.title}
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
                      {product.gallery_images.length === 1 ? "" : "s"} uploaded
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
    </div>
  );
}