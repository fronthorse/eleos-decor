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
      <div className="card border-0 shadow-sm h-100">
        <Link
          href={`/product/${id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <img
            src={image}
            className="card-img-top"
            alt={title}
            style={{
              height: "350px",
              objectFit: "cover",
            }}
          />

          <div className="card-body d-flex flex-column">
            <h5 className="card-title fw-bold">{title}</h5>

            <p className="card-text text-muted">{description}</p>
          </div>
        </Link>

        <div className="px-3 pb-3 mt-auto">
          <h6 className="fw-bold mb-3">₦{price}</h6>

          <a
            href={`https://wa.me/2348168350533?text=${encodeURIComponent(
              whatsappMessage
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-dark w-100"
          >
            Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}