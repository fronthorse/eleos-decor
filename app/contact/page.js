import Navbar from ".././components/Navbar";
import Footer from ".././components/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <section
        className="py-5"
        style={{ marginTop: "100px" }}
      >
        <div className="container">

          <div className="text-center mb-5">
            <h1 className="fw-bold">Contact Us</h1>

            <p className="text-muted">
              We’d love to help you beautify your space.
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-7">

              <div className="bg-white p-5 rounded shadow-sm">

                <div className="mb-4">
                  <h5 className="fw-bold">WhatsApp</h5>

                  <a
                    href="https://wa.me/2348168350533"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                  >
                    2348168350533
                  </a>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">Email</h5>

                  <a
                    href="mailto:eleosng@gmail.com"
                    className="text-decoration-none"
                  >
                    eleosng@gmail.com
                  </a>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">Instagram</h5>

                  <a
                    href="https://www.instagram.com/eleos_decor?igsh=cWVqaXM0MjZobXQw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                  >
                    @eleos_decor
                  </a>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold">TikTok</h5>

                  <a
                    href="https://www.tiktok.com/@interiors_by_eleos?_r=1&_t=ZS-968rurOHUaD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                  >
                    @interiors_by_eleos
                  </a>
                </div>

                <div className="alert alert-light border mt-4">
                  We deliver nationwide across Nigeria.
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