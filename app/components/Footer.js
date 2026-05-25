import Link from "next/link";

const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/return-policy", label: "Return Policy" },
  { href: "/contact", label: "Contact Us" },
];

export default function Footer() {
  return (
    <footer className="site-footer bg-dark text-white py-4">
      <div className="container text-center">
        <h5 className="fw-bold">Eleos Decor</h5>

        <p className="mb-0">
          Luxury interior decoration pieces for elegant living.
        </p>

        <nav className="footer-links mt-3" aria-label="Footer">
          {footerLinks.map((link) => (
            <Link
              href={link.href}
              className="text-white-50 text-decoration-none"
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
