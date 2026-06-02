import {
  buildAdminOrderEmailHtml,
  buildCustomerOrderEmailHtml,
  createResendClient,
  getResendEmailConfig,
  jsonEmailEnvError,
  logEmailError,
} from "../../../lib/emailNotifications";

export async function GET() {
  return Response.json(
    { success: false, error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}

export async function POST(request) {
  try {
    const config = getResendEmailConfig();

    if (config.missing.length > 0) {
      console.error("[email:order] Missing required email env vars", {
        missing: config.missing,
      });
      return jsonEmailEnvError(config.missing);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      logEmailError("order-request-json", error);
      return Response.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const {
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      items = [],
      totalAmount,
      orderNote,
    } = body;

    if (!customerName || !customerPhone) {
      return Response.json(
        {
          success: false,
          error: "Missing required order fields: customerName and customerPhone.",
        },
        { status: 400 }
      );
    }

    const resend = createResendClient(config);
    const order = {
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      items,
      totalAmount,
      orderNote,
    };

    const adminEmail = await resend.emails.send({
      from: config.fromEmail,
      to: config.toEmail,
      subject: `New Checkout Inquiry - ${orderNumber || "Eleos Decor"}`,
      html: buildAdminOrderEmailHtml(order),
    });

    if (adminEmail.error) {
      logEmailError("order-admin-send", adminEmail.error, {
        orderNumber,
        recipientConfigured: Boolean(config.toEmail),
        senderConfigured: Boolean(config.fromEmail),
      });
      return Response.json(
        { success: false, error: "Could not send admin order email." },
        { status: 502 }
      );
    }

    let customerEmailStatus = "No customer email provided.";

    if (customerEmail) {
      const customerEmailResult = await resend.emails.send({
        from: config.fromEmail,
        to: customerEmail,
        subject: "We Received Your Inquiry - Eleos Decor",
        html: buildCustomerOrderEmailHtml(order),
      });

      if (customerEmailResult.error) {
        logEmailError("order-customer-send", customerEmailResult.error, {
          orderNumber,
          customerEmailProvided: true,
        });
        customerEmailStatus = "Customer email failed.";
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
    logEmailError("order-unhandled", error);
    return Response.json(
      { success: false, error: "Unexpected email notification error." },
      { status: 500 }
    );
  }
}
