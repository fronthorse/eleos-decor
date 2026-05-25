import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PolicyPageShell, {
  PolicyLink,
  PolicySection,
} from "../components/PolicyPageShell";

const title = "Terms & Conditions";
const description =
  "Read the Eleos Decor terms for website use, product information, WhatsApp-assisted order confirmation, payment, delivery, returns, and customer conduct.";

export const metadata = {
  title: {
    absolute: "Terms & Conditions | Eleos Decor",
  },
  description,
  alternates: {
    canonical: "https://eleosdecor.com/terms",
  },
  openGraph: {
    title: "Terms & Conditions | Eleos Decor",
    description,
    url: "https://eleosdecor.com/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <PolicyPageShell
        label="Customer Care"
        title={title}
        intro="These terms explain how Eleos Decor's website, product browsing, WhatsApp-assisted checkout, delivery, and customer support work."
        lastUpdated="May 2026"
      >
        <PolicySection title="Use Of Website">
          <p>
            By using the Eleos Decor website, you agree to use it responsibly
            and only for lawful shopping, account, wishlist, review, inquiry,
            and customer support purposes.
          </p>
        </PolicySection>

        <PolicySection title="Product Information">
          <p>
            We aim to present product names, descriptions, images, dimensions,
            colors, and prices clearly. Because screens, lighting, handmade
            finishes, and supplier photography may vary, actual product colors,
            textures, scale, and details may differ slightly from what appears
            online.
          </p>
        </PolicySection>

        <PolicySection title="Availability, Prices, And Delivery Fees">
          <p>
            Product availability may change. Prices, promotions, and delivery
            fees may also change or require confirmation before an order is
            completed, especially where delivery location, item size, stock
            status, or supplier changes affect the final cost.
          </p>
        </PolicySection>

        <PolicySection title="Order Requests And Acceptance">
          <p>
            Submitting a cart, checkout inquiry, product request, or WhatsApp
            message is an order request, not automatic acceptance of an order.
            Eleos Decor accepts an order only after confirming availability,
            delivery details, payment instructions, and final order information.
          </p>
        </PolicySection>

        <PolicySection title="WhatsApp Confirmation Process">
          <p>
            Checkout is WhatsApp-assisted. After you submit an order request,
            Eleos Decor may contact you on WhatsApp to confirm product
            availability, delivery address, delivery fee, payment method,
            substitutions where needed, and the final order summary before the
            order proceeds.
          </p>
        </PolicySection>

        <PolicySection title="Payment Confirmation">
          <p>
            Orders are processed after payment details are shared and payment is
            confirmed by Eleos Decor. Where payment is not completed or cannot
            be confirmed, Eleos Decor may delay, revise, or cancel the order
            request.
          </p>
        </PolicySection>

        <PolicySection title="Delivery Within Nigeria">
          <p>
            Eleos Decor delivers within Nigeria through available delivery
            partners and logistics options. Delivery timelines may vary due to
            customer location, item size, stock movement, courier operations,
            weather, traffic, public holidays, or other circumstances outside
            our control.
          </p>
        </PolicySection>

        <PolicySection title="Returns And Exchanges">
          <p>
            Returns and exchanges are handled according to our{" "}
            <PolicyLink href="/return-policy">Return Policy</PolicyLink>. Please
            review that page for eligibility, return window, excluded items, and
            support steps.
          </p>
        </PolicySection>

        <PolicySection title="User Conduct">
          <p>
            Customers must not misuse the website, submit false information,
            interfere with site security, attempt unauthorized access, copy
            protected content for resale, or use Eleos Decor communication
            channels for abusive, fraudulent, or unlawful activity.
          </p>
        </PolicySection>

        <PolicySection title="Intellectual Property">
          <p>
            The Eleos Decor name, branding, website content, photography,
            graphics, product presentation, and design elements belong to Eleos
            Decor or its licensors. They may not be copied, republished, or used
            commercially without permission.
          </p>
        </PolicySection>

        <PolicySection title="Limitation Of Liability">
          <p>
            Eleos Decor works to keep information accurate and service reliable,
            but the website is provided as available. To the fullest extent
            permitted by law, Eleos Decor is not liable for indirect losses,
            service interruptions, third-party platform issues, delivery delays,
            or customer losses outside our reasonable control.
          </p>
        </PolicySection>

        <PolicySection title="Updates To These Terms">
          <p>
            We may update these terms from time to time to reflect changes in
            our store, checkout process, services, or legal requirements. The
            latest version will be posted on this page with an updated date.
          </p>
        </PolicySection>

        <PolicySection title="Contact And Support" isLast>
          <p>
            For questions about these terms, orders, delivery, or customer
            support, please reach us through the Eleos Decor{" "}
            <PolicyLink href="/contact">Contact Us</PolicyLink> page or
            WhatsApp.
          </p>
        </PolicySection>
      </PolicyPageShell>

      <Footer />
    </>
  );
}
