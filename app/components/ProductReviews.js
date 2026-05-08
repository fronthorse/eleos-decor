"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function ProductReviews({ productId }) {
  const supabase = createClient();
  const [reviews, setReviews] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (!error) {
      setReviews(data || []);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setMessage("Submitting review...");

    const { error } = await supabase.from("reviews").insert([
      {
        product_id: productId,
        customer_name: customerName,
        rating,
        comment,
      },
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setCustomerName("");
    setRating(5);
    setComment("");
    setMessage("Review submitted successfully.");
    fetchReviews();
  }

  return (
    <section className="py-5">
      <div className="container">
        <h3 className="fw-bold mb-4">Customer Reviews</h3>

        <div className="row g-5">
          <div className="col-lg-6">
            {reviews.length === 0 ? (
              <p className="text-muted">No reviews yet. Be the first to review this product.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-card mb-4">
                  <div className="review-stars mb-2">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>

                  <h6 className="fw-bold">{review.customer_name}</h6>
                  <p className="text-muted mb-0">{review.comment}</p>
                </div>
              ))
            )}
          </div>

          <div className="col-lg-6">
           <form onSubmit={submitReview} className="review-form-box p-4">
              <h5 className="fw-bold mb-3">Leave a Review</h5>

              <div className="mb-3">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Rating</label>
                <select
                  className="form-select"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Comment</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <button className="btn btn-dark w-100">Submit Review</button>

              {message && <p className="text-muted mt-3">{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}