export default function WhatsAppFloat() {
  const message = "Hello Eleos Decor, I would like to make an enquiry.";

  return (
    <a
      href={`https://wa.me/2348168350533?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
    >
      Chat with us
    </a>
  );
}