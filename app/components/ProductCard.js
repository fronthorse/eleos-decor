import Link from "next/link";

export default function ProductCard({
  id,
  image,
  title,
  description,
  price,
}) {
  const whatsappMessage = `Hello Eleos Decor, I want to order ${title}`;

  return (
    <div className="col-md-4">
      <div className="product-card h-100">

        <Link
          href={`/product/${id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="product-image-wrapper">
            <img
              src={image}
              className="product-image"
              alt={title}
            />
          </div>

          <div className="p-4">
            <h5 className="fw-bold mb-3">
              {title}
            </h5>

            <p className="text-muted product-description">
              {description}
            </p>
          </div>
        </Link>

        <div className="px-4 pb-4 mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              ₦{price}
            </h5>

            <span className="gold-text small fw-bold">
              Premium Decor
            </span>
          </div>

          <a
            href={`https://wa.me/2348168350533?text=${encodeURIComponent(
              whatsappMessage
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-dark w-100 py-3"
          >
            Order on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}