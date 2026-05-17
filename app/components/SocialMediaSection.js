import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

const socialLinks = [
  {
    label: "Instagram",
    handle: "@eleos_decor",
    href: "https://www.instagram.com/eleos_decor?igsh=cWVqaXM0MjZobXQw",
    icon: FaInstagram,
  },
  {
    label: "TikTok",
    handle: "@interiors_by_eleos",
    href: "https://www.tiktok.com/@interiors_by_eleos?_r=1&_t=ZS-968rurOHUaD",
    icon: FaTiktok,
  },
  {
    label: "WhatsApp",
    handle: "2348168350533",
    href: "https://wa.me/2348168350533",
    icon: FaWhatsapp,
  },
];

export default function SocialMediaSection() {
  return (
    <section className="social-section">
      <div className="container">
        <div className="social-panel">
          <div className="social-copy">
            <p className="section-label">Stay Inspired</p>
            <h2 className="luxury-heading">Follow Eleos Decor</h2>
            <p className="text-muted mb-0">
              Styling ideas, new arrivals, and warm decor inspiration.
            </p>
          </div>

          <div className="social-links-grid">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-card"
                >
                  <span className="social-icon">
                    <Icon />
                  </span>

                  <span>
                    <strong>{social.label}</strong>
                    <small>{social.handle}</small>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
