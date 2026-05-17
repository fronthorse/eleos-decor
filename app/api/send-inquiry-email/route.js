import { Resend } from "resend";
import { getCartVariantLabel } from "../../../lib/productVariants";

export async function POST(request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        { success: false, error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    if (!process.env.ADMIN_EMAIL) {
      return Response.json(
        { success: false, error: "Missing ADMIN_EMAIL" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await request.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      items = [],
      totalAmount,
      orderNote,
    } = body;

    const itemsHtml = items
      .map((item) => {
        const variantLabel = getCartVariantLabel(item);

        return `
          <li>
            <strong>${item.title}</strong><br />
            ${variantLabel ? `Selected Print: ${variantLabel}<br />` : ""}
            Quantity: ${item.quantity}<br />
            Price: ₦${item.price}
          </li>
        `;
      })
      .join("");

    const adminEmail = await resend.emails.send({
      from: "Eleos Decor <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL,
      subject: "New Checkout Inquiry - Eleos Decor",
      html: `
        <div style="font-family: sans-serif; line-height: 1.7;">
          <h2>New Checkout Inquiry</h2>

          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>
          <p><strong>Email:</strong> ${customerEmail || "Guest customer"}</p>

          <h3>Items</h3>
          <ul>${itemsHtml}</ul>

          <p><strong>Total:</strong> ₦${Number(totalAmount).toLocaleString()}</p>

          <p><strong>Order Note:</strong> ${orderNote || "None"}</p>
        </div>
      `,
    });

    if (adminEmail.error) {
      return Response.json(
        { success: false, error: adminEmail.error },
        { status: 400 }
      );
    }

    let customerEmailStatus = "No customer email provided.";

    if (customerEmail) {
      const customerEmailResult = await resend.emails.send({
        from: "Eleos Decor <onboarding@resend.dev>",
        to: customerEmail,
        subject: "We Received Your Inquiry - Eleos Decor",
        html: `
          <div style="font-family: sans-serif; line-height: 1.7;">
            <h2>Thank You for Shopping with Eleos Decor</h2>

            <p>Hello ${customerName},</p>

            <p>We have received your checkout inquiry successfully.</p>

            <p>
              Our team will contact you shortly to confirm your order details and payment.
            </p>

            <h3>Order Summary</h3>
            <ul>${itemsHtml}</ul>

            <p><strong>Total:</strong> ₦${Number(totalAmount).toLocaleString()}</p>

            <p>Thank you for choosing Eleos Decor.</p>
          </div>
        `,
      });

      if (customerEmailResult.error) {
        customerEmailStatus = customerEmailResult.error;
      } else {
        customerEmailStatus = "Customer email sent.";
      }
    }

    return Response.json({
      success: true,
      adminEmail: "Admin email sent.",
      customerEmail: customerEmailStatus,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
