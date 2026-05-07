"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const [products, setProducts] = useState([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Frames");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
const [checkingAuth, setCheckingAuth] = useState(true);
  const [editingProductId, setEditingProductId] = useState(null);

useEffect(() => {
  checkUserSession();
}, []);

async function checkUserSession() {
  const { data } = await supabase.auth.getSession();

  if (data.session?.user) {
    setUser(data.session.user);
    fetchProducts();
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
      setMessage(error.message);
      return;
    }

    setUser(data.user);
    setMessage("");
    setCheckingAuth(false);
    fetchProducts();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProducts([]);
    setCheckingAuth(false);
    setMessage("Logged out successfully.");
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

    setProducts(data);
  }

  function handleEditProduct(product) {
    setEditingProductId(product.id);
    setTitle(product.title);
    setCategory(product.category);
    setPrice(product.price);
    setDescription(product.description);
    setImageFile(null);
    setMessage("Editing product. Update the details and save.");
  }

  function cancelEdit() {
    setEditingProductId(null);
    setTitle("");
    setCategory("Frames");
    setPrice("");
    setDescription("");
    setImageFile(null);
    setMessage("");
  }

  async function handleDeleteProduct(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Product deleted successfully.");
    fetchProducts();
  }

  async function handleUploadProduct(e) {
    e.preventDefault();

    if (editingProductId) {
      setMessage("Updating product...");

      let updatedProduct = {
        title,
        category,
        price,
        description,
      };

      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, imageFile);

        if (uploadError) {
          setMessage(uploadError.message);
          return;
        }

        const { data: imageData } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);

        updatedProduct.image_url = imageData.publicUrl;
      }

      const { error } = await supabase
        .from("products")
        .update(updatedProduct)
        .eq("id", editingProductId);

      if (error) {
        setMessage(error.message);
        return;
      }

      setEditingProductId(null);
      setTitle("");
      setCategory("Frames");
      setPrice("");
      setDescription("");
      setImageFile(null);

      setMessage("Product updated successfully.");
      fetchProducts();
      return;
    }

    setMessage("Uploading product...");

    if (!imageFile) {
      setMessage("Please select a product image.");
      return;
    }

    const fileName = `${Date.now()}-${imageFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile);

    if (uploadError) {
      setMessage(uploadError.message);
      return;
    }

    const { data: imageData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase
      .from("products")
      .insert([
        {
          title,
          category,
          price,
          description,
          image_url: imageData.publicUrl,
        },
      ]);

    if (insertError) {
      setMessage(insertError.message);
      return;
    }

    setTitle("");
    setCategory("Frames");
    setPrice("");
    setDescription("");
    setImageFile(null);

    setMessage("Product uploaded successfully.");
    fetchProducts();
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
      <div className="container py-5" style={{ maxWidth: "500px" }}>
        <h1 className="fw-bold mb-4">Eleos Decor Admin</h1>

        <form onSubmit={handleLogin} className="bg-white p-4 rounded shadow-sm">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-dark w-100">Login</button>

          {message && <p className="mt-3 text-muted">{message}</p>}
        </form>
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
          <label className="form-label">Description</label>
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
              ? "Replace Product Image (Optional)"
              : "Product Image"}
          </label>

          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            required={!editingProductId}
          />
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

                  <div className="d-flex gap-2 mt-auto">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="btn btn-outline-dark w-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.id)}
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