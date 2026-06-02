import {
  createResendClient,
  getResendEmailConfig,
  jsonEmailEnvError,
  logEmailError,
} from "../../../lib/emailNotifications";

function testEmailTokenIsValid(request) {
  const requiredToken = process.env.EMAIL_TEST_TOKEN || process.env.TEST_EMAIL_TOKEN;

  if (!requiredToken) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("x-email-test-token") === requiredToken;
}

export async function GET() {
  const config = getResendEmailConfig();

  return Response.json({
    success: config.missing.length === 0,
    ready: config.missing.length === 0,
    missing: config.missing,
    message:
      config.missing.length === 0
        ? "Email test route is configured. POST to send a test email."
        : "Email test route is missing required configuration.",
  });
}

export async function POST(request) {
  try {
    if (!testEmailTokenIsValid(request)) {
      return Response.json(
        {
          success: false,
          error:
            "Email test route is protected. Set EMAIL_TEST_TOKEN and send it in the x-email-test-token header.",
        },
        { status: 403 }
      );
    }

    const config = getResendEmailConfig();

    if (config.missing.length > 0) {
      console.error("[email:test] Missing required email env vars", {
        missing: config.missing,
      });
      return jsonEmailEnvError(config.missing);
    }

    const resend = createResendClient(config);
    const result = await resend.emails.send({
      from: config.fromEmail,
      to: config.toEmail,
      subject: "Eleos Decor test email",
      html: `
        <div style="font-family: sans-serif; line-height: 1.7;">
          <h2>Eleos Decor email test</h2>
          <p>Resend is configured and this test email was sent successfully.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    if (result.error) {
      logEmailError("test-send", result.error, {
        recipientConfigured: Boolean(config.toEmail),
        senderConfigured: Boolean(config.fromEmail),
      });
      return Response.json(
        { success: false, error: "Could not send test email." },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      message: "Test email sent.",
      id: result.data?.id,
    });
  } catch (error) {
    logEmailError("test-unhandled", error);
    return Response.json(
      { success: false, error: "Unexpected test email error." },
      { status: 500 }
    );
  }
}
