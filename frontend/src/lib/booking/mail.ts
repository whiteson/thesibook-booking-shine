import nodemailer from "nodemailer";

export async function sendPlatformMail(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<boolean> {
  const host = process.env.SMTP_HOST ?? "127.0.0.1";
  const port = Number(process.env.SMTP_PORT ?? 1025);
  const user = process.env.SMTP_USER || undefined;
  const pass = process.env.SMTP_PASSWORD || undefined;
  const from = process.env.SMTP_FROM ?? "ThesiBook <info@thesibook.gr>";
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass: pass ?? "" } : undefined,
    });
    await transport.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
    return true;
  } catch {
    console.error("[mail] send failed");
    return false;
  }
}
