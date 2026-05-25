import Link from "next/link";

export function PolicyList({ items }) {
  return (
    <ul className="policy-list text-muted mb-0">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function PolicySection({ title, children, isLast = false }) {
  return (
    <section className={isLast ? "policy-section mb-0" : "policy-section"}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function PolicyLink({ href, children }) {
  return (
    <Link href={href} className="policy-inline-link">
      {children}
    </Link>
  );
}

export default function PolicyPageShell({
  label,
  title,
  intro,
  lastUpdated,
  children,
}) {
  return (
    <main className="luxury-section policy-page" style={{ marginTop: "90px" }}>
      <div className="container">
        <div className="text-center mb-5">
          <p className="section-label">{label}</p>
          <h1 className="luxury-heading">{title}</h1>
          <p className="text-muted mx-auto policy-intro">{intro}</p>
          <p className="policy-updated">Last updated: {lastUpdated}</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-9 col-xl-8">
            <div className="policy-card">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
