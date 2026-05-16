import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: {
    absolute: "Return & Exchange Policy | Eleos Decor",
  },
  description:
    "Read Eleos Decor's return and exchange policy for damaged, defective, or wrong items delivered across Nigeria.",
  alternates: {
    canonical: "https://eleosdecor.com/return-policy",
  },
  openGraph: {
    title: "Return & Exchange Policy | Eleos Decor",
    description:
      "Read Eleos Decor's return and exchange policy for damaged, defective, or wrong items delivered across Nigeria.",
    url: "/return-policy",
  },
};

const eligibleReasons = [
  "Damaged items",
  "Wrong items delivered",
  "Defective products",
];

const eligibilityRules = [
  "Be unused",
  "Be in their original condition",
  "Include original packaging where possible",
];

const excludedItems = [
  "Customized or special-order items",
  "Clearance/sale items",
  "Products damaged after delivery due to misuse",
];

const requestDetails = [
  "Your order details",
  "Clear photos/videos of the issue",
  "A brief explanation",
];

const sellerShippingCases = [
  "The wrong item was delivered",
  "The item arrived damaged",
  "The product is defective",
];

function PolicyList({ items }) {
  return (
    <ul className="text-muted mb-0">
      {items.map((item) => (
        <li className="mb-2" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ReturnPolicyPage() {
  return (
    <>
      <Navbar />

      <main className="luxury-section" style={{ marginTop: "90px" }}>
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-label">Customer Care</p>
            <h1 className="luxury-heading">Return & Exchange Policy</h1>
            <p className="text-muted mx-auto" style={{ maxWidth: "720px" }}>
              At Eleos Decor, customer satisfaction is important to us. If
              there is an issue with your order, we are happy to help.
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="bg-white p-4 p-md-5 rounded shadow-sm">
                <section className="mb-5">
                  <h2 className="fw-bold h4 mb-3">Return Window</h2>
                  <p className="text-muted mb-3">
                    Returns or exchanges may be requested within 7 days of
                    delivery for:
                  </p>
                  <PolicyList items={eligibleReasons} />
                </section>

                <section className="mb-5">
                  <h2 className="fw-bold h4 mb-3">Eligibility</h2>
                  <p className="text-muted mb-3">To be eligible, items must:</p>
                  <PolicyList items={eligibilityRules} />
                </section>

                <section className="mb-5">
                  <h2 className="fw-bold h4 mb-3">Items Not Eligible</h2>
                  <p className="text-muted mb-3">
                    We currently do not accept returns for:
                  </p>
                  <PolicyList items={excludedItems} />
                </section>

                <section className="mb-5">
                  <h2 className="fw-bold h4 mb-3">How To Request Help</h2>
                  <p className="text-muted mb-3">
                    To request a return or exchange, kindly contact us through
                    WhatsApp or our contact channels with:
                  </p>
                  <PolicyList items={requestDetails} />
                  <p className="text-muted mt-3 mb-0">
                    Our team will review the request and provide the next
                    steps.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="fw-bold h4 mb-3">
                    Refunds, Replacements & Inspection
                  </h2>
                  <p className="text-muted mb-0">
                    Approved refunds or replacements will be processed after the
                    returned item has been inspected and confirmed.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="fw-bold h4 mb-3">Return Shipping Costs</h2>
                  <p className="text-muted mb-3">
                    Customers are responsible for return shipping costs unless:
                  </p>
                  <PolicyList items={sellerShippingCases} />
                </section>

                <section className="border-top pt-4">
                  <h2 className="fw-bold h4 mb-3">Nationwide Delivery</h2>
                  <p className="text-muted mb-0">
                    Eleos Decor offers nationwide delivery across Nigeria and
                    works to ensure all items arrive safely and in excellent
                    condition.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
