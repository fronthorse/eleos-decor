"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext";

export default function WhatsAppOrderBox({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const { addToCart } = useCart();

  const whatsappNumber = "2348168350533";

  const message = `
Hello Eleos Decor,


I would like to order:

Product: ${product.title}
Category: ${product.category}
Price: ₦${product.price}
Quantity: ${quantity}

Additional note:
${note || "None"}

Thank you.
`;

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <div className="bg-white p-4 rounded shadow-sm mt-4">
      <h5 className="fw-bold mb-3">Order This Product</h5>

      <div className="mb-3">
        <label className="form-label">Quantity</label>
        <input
          type="number"
          min="1"
          className="form-control"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Order Note</label>
        <textarea
          className="form-control"
          rows="3"
          placeholder="Example: I want 2 pieces, please confirm availability."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>
<button
  onClick={() =>
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
    })
  }
  className="btn btn-outline-dark btn-lg w-100 mb-3"
>
  Add to Cart
</button>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-dark btn-lg w-100"
      >
        Order on WhatsApp
      </a>
    </div>
  );
}