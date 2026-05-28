import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PolicyPageShell, {
  PolicyLink,
  PolicyList,
  PolicySection,
} from "../components/PolicyPageShell";

const title = "Privacy Policy";
const description =
  "Learn how Eleos Decor collects, uses, protects, and manages customer information for orders, accounts, wishlist, reviews, and WhatsApp-assisted commerce in Nigeria.";

export const metadata = {
  title: {
    absolute: "Privacy Policy | Eleos Decor",
  },
  description,
  alternates: {
    canonical: "https://eleosdecor.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Eleos Decor",
    description,
    url: "https://eleosdecor.com/privacy",
  },
};

const collectedInformation = [
  "Name, phone number, email address, and delivery address.",
  "Cart contents, order request details, product preferences, and order inquiry history.",
  "Wishlist items, product reviews, support messages, and WhatsApp follow-up details.",
  "Account and profile information, including details used for customer login or Google authentication.",
];

const informationUses = [
  "Process order requests and confirm product availability, delivery, payment, and final order details.",
  "Provide customer support through WhatsApp, email, and other Eleos Decor contact channels.",
  "Personalize your shopping experience, wishlist, cart, and product recommendations.",
  "Protect customer accounts, prevent misuse, improve site performance, and maintain service security.",
  "Understand how customers use the website so we can improve products, content, and support.",
];

const serviceProviders = [
  "Supabase for customer profiles, authentication data, wishlist, reviews, order inquiries, and related store data.",
  "Vercel for website hosting, deployment, performance, and reliability.",
  "Google Authentication when customers choose to sign in with Google.",
  "WhatsApp for order follow-up, customer communication, and assisted checkout.",
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <PolicyPageShell
        label="Customer Care"
        title={title}
        intro="Your privacy matters to Eleos Decor. This policy explains the information we collect, why we use it, and how we protect it while helping you shop premium decor pieces across Nigeria."
        lastUpdated="May 2026"
      >
        <PolicySection title="Information We Collect">
          <p>
            We collect information you provide directly and information created
            while you use Eleos Decor. This may include:
          </p>
          <PolicyList items={collectedInformation} />
        </PolicySection>

        <PolicySection title="How We Use Information">
          <p>We use customer information to support a smooth shopping journey.</p>
          <PolicyList items={informationUses} />
        </PolicySection>

        <PolicySection title="WhatsApp-Assisted Communication">
          <p>
            Eleos Decor uses WhatsApp-assisted commerce. When you submit an
            order request, contact us, or ask about a product, our team may
            follow up on WhatsApp to confirm availability, delivery options,
            payment instructions, and final order details before completion.
          </p>
        </PolicySection>

        <PolicySection title="Google Login And Authentication">
          <p>
            If you sign in with Google, Google may share basic account
            information such as your name and email address so we can create or
            access your Eleos Decor customer profile. Your use of Google login
            is also subject to Google&apos;s own privacy and account policies.
          </p>
        </PolicySection>

        <PolicySection title="Third-Party Services">
          <p>
            We work with trusted service providers that help us operate Eleos
            Decor securely and reliably:
          </p>
          <PolicyList items={serviceProviders} />
        </PolicySection>

        <PolicySection title="Payments">
          <p>
            Eleos Decor does not store card details directly on this website.
            Payment instructions or confirmations are handled through approved
            channels shared during the WhatsApp confirmation process.
          </p>
        </PolicySection>

        <PolicySection title="Cookies And Basic Analytics">
          <p>
            We may use cookies, browser storage, and basic analytics tools to
            keep carts and sessions working, remember preferences, understand
            site usage, and improve the shopping experience.
          </p>
        </PolicySection>

        <PolicySection title="Data Protection And Security">
          <p>
            We use reasonable technical and organizational measures to protect
            customer information against unauthorized access, loss, misuse, or
            alteration. No online service can be guaranteed to be completely
            secure, but we work to keep customer data handled carefully.
          </p>
        </PolicySection>

        <PolicySection title="Correction And Deletion Requests">
          <p>
            You may request correction, update, or deletion of your personal
            information where applicable. Some records may need to be retained
            for order, support, security, or legal reasons.
          </p>
        </PolicySection>

        <PolicySection title="Contact And Support" isLast>
          <p>
            For privacy questions or customer support, please contact us through
            the Eleos Decor <PolicyLink href="/contact">Contact Us</PolicyLink>{" "}
            page or send a message on WhatsApp.
          </p>
        </PolicySection>
      </PolicyPageShell>

      <Footer />
    </>
  );
}
