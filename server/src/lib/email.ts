import { Resend } from "resend";

type EmailDeliveryResult = {
  sent: boolean;
  provider: "brevo" | "resend" | "terminal";
  errorMessage?: string;
};

type TransactionalEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  developmentUrl?: string;
};

let resendClient: Resend | null = null;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSender() {
  return {
    name:
      process.env.BREVO_SENDER_NAME ||
      process.env.RESEND_FROM_NAME ||
      "FlowDeck",
    email:
      process.env.BREVO_SENDER_EMAIL ||
      process.env.RESEND_FROM_EMAIL ||
      "onboarding@resend.dev",
  };
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

async function readBrevoError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; code?: string };
    return body.message || body.code || `Brevo returned HTTP ${response.status}`;
  } catch {
    return `Brevo returned HTTP ${response.status}`;
  }
}

async function sendWithBrevo(
  input: TransactionalEmailInput
): Promise<EmailDeliveryResult> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return {
      sent: false,
      provider: "brevo",
      errorMessage: "BREVO_API_KEY is not configured",
    };
  }

  const sender = getSender();
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.html,
      textContent: input.text,
      ...(input.replyTo && { replyTo: { email: input.replyTo } }),
    }),
  });

  if (!response.ok) {
    throw new Error(await readBrevoError(response));
  }

  return { sent: true, provider: "brevo" };
}

async function sendTransactionalEmail(
  input: TransactionalEmailInput
): Promise<EmailDeliveryResult> {
  try {
    if (process.env.BREVO_API_KEY) {
      const result = await sendWithBrevo(input);
      console.log(`[email] Sent with Brevo to ${input.to}: ${input.subject}`);
      return result;
    }

    const resend = getResendClient();
    if (resend) {
      const sender = getSender();
      const result = await resend.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(input.replyTo && { replyTo: input.replyTo }),
      });

      if (result.error) throw new Error(result.error.message);
      console.log(`[email] Sent with Resend to ${input.to}: ${input.subject}`);
      return { sent: true, provider: "resend" };
    }

    console.warn(
      `[email] No provider configured. ${input.subject}${
        input.developmentUrl ? `: ${input.developmentUrl}` : ""
      }`
    );
    return {
      sent: false,
      provider: "terminal",
      errorMessage: "Email service is not configured",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[email] Failed to send to ${input.to}: ${message}`);
    return {
      sent: false,
      provider: process.env.BREVO_API_KEY ? "brevo" : "resend",
      errorMessage: message,
    };
  }
}

export async function sendAccountEmail(input: {
  to: string;
  subject: string;
  heading: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
}): Promise<EmailDeliveryResult> {
  const heading = escapeHtml(input.heading);
  const message = escapeHtml(input.message);
  const actionLabel = escapeHtml(input.actionLabel);
  const actionUrl = escapeHtml(input.actionUrl);

  return sendTransactionalEmail({
    to: input.to,
    subject: input.subject,
    developmentUrl: input.actionUrl,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f6f3;padding:40px 20px">
        <div style="max-width:560px;margin:auto;background:#fff;border:1px solid #e7e2de;border-radius:20px;overflow:hidden">
          <div style="background:#0f3040;color:#fff;padding:28px 40px;font-size:24px;font-weight:700">FlowDeck</div>
          <div style="padding:40px">
            <h1 style="color:#18242b;font-size:28px;margin:0 0 16px">${heading}</h1>
            <p style="color:#687078;font-size:16px;line-height:1.6;margin:0 0 28px">${message}</p>
            <a href="${actionUrl}" style="display:inline-block;background:#0f3040;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:600">${actionLabel}</a>
            <p style="color:#687078;font-size:13px;line-height:1.6;margin:28px 0 8px">If the button does not work, copy this link:</p>
            <p style="font-size:13px;word-break:break-all;margin:0"><a href="${actionUrl}" style="color:#a56f63">${actionUrl}</a></p>
          </div>
        </div>
      </div>`,
    text: `${input.heading}\n\n${input.message}\n\n${input.actionUrl}`,
  });
}

type SendInvitationEmailInput = {
  recipientEmail: string;
  recipientName?: string | null;
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  role: string;
  inviteToken: string;
  acceptInviteUrl: string;
};

export async function sendInvitationEmail(
  input: SendInvitationEmailInput
): Promise<EmailDeliveryResult> {
  const inviterName = escapeHtml(input.inviterName);
  const inviterEmail = escapeHtml(input.inviterEmail);
  const organizationName = escapeHtml(input.organizationName);
  const acceptInviteUrl = escapeHtml(input.acceptInviteUrl);
  const greetingName = escapeHtml(
    input.recipientName?.trim() || input.recipientEmail
  );
  const roleLabel = input.role === "ADMIN" ? "as an Admin" : "as a Member";
  const subject = `${input.inviterName} invited you to join ${input.organizationName} on FlowDeck`;

  return sendTransactionalEmail({
    to: input.recipientEmail,
    subject,
    replyTo: input.inviterEmail,
    developmentUrl: input.acceptInviteUrl,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f6f3;padding:40px 20px">
        <div style="max-width:560px;margin:auto;background:#fff;border:1px solid #e7e2de;border-radius:20px;overflow:hidden">
          <div style="background:#0f3040;color:#fff;padding:28px 40px;font-size:24px;font-weight:700">FlowDeck</div>
          <div style="padding:40px">
            <h1 style="color:#18242b;font-size:28px;margin:0 0 16px">You’re invited!</h1>
            <p style="color:#687078;font-size:16px;line-height:1.6">Hi ${greetingName},</p>
            <p style="color:#18242b;font-size:16px;line-height:1.6"><strong>${inviterName}</strong> (${inviterEmail}) invited you to join <strong>${organizationName}</strong> ${roleLabel}.</p>
            <a href="${acceptInviteUrl}" style="display:inline-block;background:#0f3040;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin:16px 0">Accept invitation</a>
            <p style="color:#687078;font-size:13px;line-height:1.6">This invitation expires in seven days. If the button does not work, copy this link:</p>
            <p style="font-size:13px;word-break:break-all"><a href="${acceptInviteUrl}" style="color:#a56f63">${acceptInviteUrl}</a></p>
          </div>
        </div>
      </div>`,
    text: `You’re invited to join ${input.organizationName} on FlowDeck.\n\n${input.inviterName} (${input.inviterEmail}) invited you ${roleLabel}.\n\nAccept the invitation:\n${input.acceptInviteUrl}\n\nThis invitation expires in seven days.`,
  });
}
