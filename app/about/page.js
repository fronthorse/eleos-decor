import Navbar from ".././components/Navbar";
import Footer from ".././components/Footer";

export const metadata = {
  title: "About",
  description:
    "Learn about Eleos Decor, a Nigerian home and office decor brand curating warm, elegant, and affordable luxury decor pieces.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Eleos Decor",
    description:
      "Learn about Eleos Decor, a Nigerian home and office decor brand curating warm, elegant, and affordable luxury decor pieces.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <section
        className="py-5"
        style={{ marginTop: "100px" }}
      >
        <div className="container">

          <div className="text-center mb-5">
            <h1 className="fw-bold">About Eleos Decor</h1>

            <p className="text-muted">
              Bringing warmth, beauty, and elegance into every space.
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">

              <div className="bg-white p-5 rounded shadow-sm">

                <p className="lead text-muted">
                  At Eleos Decor, we believe beautiful spaces should
                  feel warm, stylish, and welcoming without being overly
                  expensive.
                </p>

                <p className="text-muted">
                  We provide quality and affordable décor pieces for both
                  homes and office spaces, helping you transform your
                  environment into a place of comfort, elegance, and personality.
                </p>

                <p className="text-muted">
                  From elegant wall frames and faux flowers to decorative
                  lighting and interior accessories, every item is selected
                  with care to help you create a space you truly love.
                </p>

                <div className="mt-4">
                  <span className="badge bg-dark me-2 p-2">
                    Nationwide Delivery
                  </span>

                  <span className="badge bg-secondary p-2">
                    Home & Office Decor
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
