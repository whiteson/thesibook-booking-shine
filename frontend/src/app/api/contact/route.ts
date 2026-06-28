const API_BASE =
  process.env.WORDPRESS_API_URL ??
  "http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  businessType?: string;
  message?: string;
  website?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ContactPayload | null;

  if (!body?.name?.trim() || !body?.email?.trim()) {
    return Response.json(
      { success: false, message: "Name and email are required." },
      { status: 400 },
    );
  }

  const message =
    body.message?.trim() ||
    [
      body.businessType ? `Τύπος επιχείρησης: ${body.businessType}` : "",
      body.phone ? `Τηλέφωνο: ${body.phone}` : "",
      body.company ? `Επιχείρηση: ${body.company}` : "",
    ]
      .filter(Boolean)
      .join("\n");

  try {
    const response = await fetch(`${API_BASE.replace(/\/$/, "")}/contact`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() ?? "",
        company: body.company?.trim() ?? "",
        businessType: body.businessType?.trim() ?? "",
        message,
        website: body.website ?? "",
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null;

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          message: payload?.message ?? "Could not send your request.",
        },
        { status: response.status },
      );
    }

    return Response.json({
      success: payload?.ok !== false,
      message: payload?.message ?? "Contact request received.",
    });
  } catch {
    return Response.json(
      { success: false, message: "Could not reach the contact service." },
      { status: 502 },
    );
  }
}
