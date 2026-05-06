export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm fixed-top py-3">
      <div className="container">
        <a
          className="navbar-brand fw-bold fs-3"
          href="/"
          style={{
            color: "#1f1f1f",
            letterSpacing: "1px",
          }}
        >
          Eleos Decor
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <li className="nav-item">
              <a className="nav-link fw-medium" href="/">
                Home
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link fw-medium" href="/shop">
                Shop
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link fw-medium" href="/about">
  About
</a>
            </li>

            <li className="nav-item">
              <a className="btn btn-dark px-4" href="/shop">
                Shop Now
              </a>
            </li>
            <li className="nav-item">
  <a className="nav-link fw-medium" href="/contact">
    Contact
  </a>
</li>
          </ul>
        </div>
      </div>
    </nav>
  );
}