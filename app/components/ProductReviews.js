"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaStar } from "react-icons/fa";
import { createClient } from "../../lib/supabase/client";

const RATING_LABELS = {
  1: "Needs work",
  2: "Fair",
  3: "Lovely",
  4: "Excellent",
  5: "Exceptional",
};

function ReviewStars({ rating, className = "" }) {
  return (
    <div
      className={`review-stars review-stars-display ${className}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;

        return (
          <span
            key={starValue}
            className={starValue <= Number(rating || 0) ? "active" : ""}
          >
            <FaStar aria-hidden="true" />
          </span>
        );
      })}
    </div>
  );
}

export default function ProductReviews({ productId, initialReviews = [] }) {
  const supabase = useMemo(() => createClient(), []);
  const [reviews, setReviews] = useState(initialReviews);
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const activeRating = hoverRating || rating;

  const fetchReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("id,customer_name,rating,comment,created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) {
      setReviews(data || []);
    }
  }, [productId, supabase]);

  useEffect(() => {
    if (initialReviews.length > 0) {
      return;
    }

    fetchReviews();
  }, [fetchReviews, initialReviews.length]);

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
    setHoverRating(0);
    setComment("");
    setMessage("Review submitted successfully.");
    fetchReviews();
  }

  function handleRatingKeyDown(event) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setRating((current) => Math.min(5, current + 1));
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setRating((current) => Math.max(1, current - 1));
    }

    if (event.key === "Home") {
      event.preventDefault();
      setRating(1);
    }

    if (event.key === "End") {
      event.preventDefault();
      setRating(5);
    }
  }

  return (
    <section className="product-reviews-section">
      <div className="container">
        <div className="product-section-heading">
          <p className="section-label">Customer Notes</p>
          <h2>Reviews</h2>
          <p>
            Real customer impressions help each piece feel easier to imagine at
            home.
          </p>
        </div>

        <div className="product-reviews-layout">
          <div>
            {reviews.length === 0 ? (
              <div className="product-review-empty">
                <h3>No reviews yet</h3>
                <p>
                  Be the first to share how this piece looks or feels in your
                  space.
                </p>
              </div>
            ) : (
              <div className="product-review-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-card product-review-card">
                    <div className="review-card-header">
                      <ReviewStars rating={review.rating} />

                      {review.created_at && (
                        <time dateTime={review.created_at}>
                          {new Date(review.created_at).toLocaleDateString(
                            "en-NG",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </time>
                      )}
                    </div>

                    <p className="review-card-comment">{review.comment}</p>
                    <h6>{review.customer_name}</h6>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <form onSubmit={submitReview} className="review-form-box">
              <h5>Leave a Review</h5>

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
                <span className="form-label d-block">Rating</span>
                <div
                  className="review-rating-picker"
                  role="radiogroup"
                  aria-label="Choose a rating"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <div className="review-star-selector">
                    {Array.from({ length: 5 }, (_, index) => {
                      const starValue = index + 1;

                      return (
                        <button
                          key={starValue}
                          type="button"
                          role="radio"
                          aria-checked={rating === starValue}
                          aria-label={`${starValue} star${
                            starValue === 1 ? "" : "s"
                          } - ${RATING_LABELS[starValue]}`}
                          className={`review-star-button ${
                            starValue <= activeRating ? "active" : ""
                          }`}
                          onClick={() => setRating(starValue)}
                          onFocus={() => setHoverRating(starValue)}
                          onBlur={() => setHoverRating(0)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onKeyDown={handleRatingKeyDown}
                        >
                          <FaStar aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>

                  <span className="review-rating-value">
                    {activeRating} / 5
                    <strong>{RATING_LABELS[activeRating]}</strong>
                  </span>
                </div>
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
