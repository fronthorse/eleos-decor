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
      setReviews(data || []);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="luxury-section bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <p className="section-label">Customer Love</p>
          <h2 className="luxury-heading">What Our Customers Say</h2>
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
