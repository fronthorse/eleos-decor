"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const supabase = createClient();

  async function fetchReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6);

    if (!error) {
      const polishedReviews = (data || [])
        .filter((review) => {
          const comment = String(review.comment || "").trim();
          const customerName = String(review.customer_name || "").trim();
          const lowerComment = comment.toLowerCase();
          const lowerName = customerName.toLowerCase();

          return (
            Number(review.rating) >= 4 &&
            comment.length >= 24 &&
            !["test", "admin"].includes(lowerComment) &&
            !["test", "admin"].includes(lowerName) &&
            lowerComment !== "good product"
          );
        })
        .slice(0, 3);

      setReviews(polishedReviews);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="home-testimonials-section bg-white">
      <div className="container">
        <div className="text-center home-compact-section-header">
          <p className="section-label">Customer Love</p>
          <h2 className="luxury-heading">Styled spaces, happy customers.</h2>
          <p className="text-muted">
            Real feedback from people beautifying their spaces with Eleos Decor.
          </p>
        </div>

        <div className="row g-4">
          {reviews.map((review) => (
            <div className="col-md-4" key={review.id}>
              <div className="review-card h-100">
                <div className="review-stars mb-3">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>

                <p className="text-muted">“{review.comment}”</p>

                <h6 className="fw-bold mb-0">{review.customer_name}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
