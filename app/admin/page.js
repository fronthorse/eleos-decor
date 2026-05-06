"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Frames");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

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
  }

  async function handleUploadProduct(e) {
    e.preventDefault();
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
      </div>

      <form
        onSubmit={handleUploadProduct}
        className="bg-white p-4 rounded shadow-sm"
        style={{ maxWidth: "700px" }}
      >
        <h4 className="fw-bold mb-4">Upload New Product</h4>

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
          <label className="form-label">Product Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            required
          />
        </div>

        <button className="btn btn-dark w-100">Upload Product</button>

        {message && <p className="mt-3 text-muted">{message}</p>}
      </form>
    </div>
  );
}