import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "Society Maintenance <notifications@resend.dev>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const societyName = process.env.NEXT_PUBLIC_SOCIETY_NAME || "Greenwood Heights Residents Association";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface StatusEmailParams {
  to: string;
  residentName: string;
  complaintId: string;
  complaintTitle: string;
  category: string;
  previousStatus: string | null;
  newStatus: string;
  actorName: string;
  note?: string | null;
}

export interface NoticeEmailParams {
  to: string[];
  noticeId: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
}

export interface ComplaintCreatedEmailParams {
  to: string;
  residentName: string;
  complaintId: string;
  complaintTitle: string;
  category: string;
  priority: string;
}

/**
 * Send an email using Resend, or output to console/mock log in development if no API key is set.
 */
async function sendMail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string; mock?: boolean; error?: any }> {
  const recipients = Array.isArray(to) ? to : [to];

  if (!resend) {
    console.log("\n=======================================================");
    console.log("📨 [DEV EMAIL MOCK LOGGER] No RESEND_API_KEY configured.");
    console.log(`To: ${recipients.join(", ")}`);
    console.log(`From: ${emailFrom}`);
    console.log(`Subject: ${subject}`);
    console.log("-------------------------------------------------------");
    console.log(`Preview (HTML snippet): ${html.substring(0, 300)}...`);
    console.log("=======================================================\n");
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: recipients,
      subject,
      html,
    });

    if (error) {
      console.error("Resend Email sending error:", error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Unexpected error in sendMail:", error);
    return { success: false, error };
  }
}

/**
 * Send notification when a complaint's status is changed
 */
export async function sendComplaintStatusChangeNotification(params: StatusEmailParams) {
  const {
    to,
    residentName,
    complaintId,
    complaintTitle,
    category,
    previousStatus,
    newStatus,
    actorName,
    note,
  } = params;

  const complaintUrl = `${appUrl}/resident/complaints/${complaintId}`;

  const statusColor =
    newStatus === "RESOLVED"
      ? "#10b981"
      : newStatus === "IN_PROGRESS"
      ? "#3b82f6"
      : "#f59e0b";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
          .header p { margin: 6px 0 0; color: #94a3b8; font-size: 13px; }
          .body { padding: 28px; }
          .badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600; color: #ffffff; background-color: ${statusColor}; margin-top: 8px; }
          .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .details-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .note-box { background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-size: 14px; font-style: italic; }
          .button { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; text-align: center; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>${societyName}</h1>
            <p>Maintenance Desk Update Notification</p>
          </div>
          <div class="body">
            <p>Hello <strong>${residentName}</strong>,</p>
            <p>Your maintenance request status has been updated by the society administration.</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <span style="font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">New Status</span><br/>
              <span class="badge">${newStatus.replace("_", " ")}</span>
            </div>

            <div class="details-box">
              <div class="details-row"><strong>Complaint:</strong> <span>${complaintTitle}</span></div>
              <div class="details-row"><strong>Category:</strong> <span>${category}</span></div>
              <div class="details-row"><strong>Previous Status:</strong> <span>${previousStatus ? previousStatus.replace("_", " ") : "N/A"}</span></div>
              <div class="details-row"><strong>Updated By:</strong> <span>${actorName}</span></div>
            </div>

            ${
              note
                ? `<p><strong>Admin Note:</strong></p><div class="note-box">"${note}"</div>`
                : ""
            }

            <div style="text-align: center; margin-top: 24px;">
              <a href="${complaintUrl}" class="button">View Full Complaint Details</a>
            </div>
          </div>
          <div class="footer">
            <p>You received this email because you are a registered resident of ${societyName}.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendMail({
    to,
    subject: `[Update] ${complaintTitle} is now ${newStatus.replace("_", " ")} - ${societyName}`,
    html,
  });
}

/**
 * Send notification when an important notice is published
 */
export async function sendImportantNoticeNotification(params: NoticeEmailParams) {
  const { to, noticeId, title, content, category, authorName } = params;
  if (!to || to.length === 0) return { success: true, count: 0 };

  const noticeUrl = `${appUrl}/resident/notices`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #e11d48; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
          .header p { margin: 6px 0 0; color: #ffe4e6; font-size: 13px; }
          .body { padding: 28px; }
          .important-tag { display: inline-block; background: #ffe4e6; color: #be123c; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px; }
          .notice-content { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin: 16px 0; }
          .button { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; text-align: center; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>📌 IMPORTANT NOTICE BROADCAST</h1>
            <p>${societyName}</p>
          </div>
          <div class="body">
            <span class="important-tag">CATEGORY: ${category.toUpperCase()}</span>
            <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">${title}</h2>
            
            <div class="notice-content">${content}</div>

            <p style="font-size: 13px; color: #64748b;">Published by Administration (${authorName})</p>

            <div style="text-align: center; margin-top: 24px;">
              <a href="${noticeUrl}" class="button">Open Notice Board</a>
            </div>
          </div>
          <div class="footer">
            <p>Sent to all registered residents of ${societyName}.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendMail({
    to,
    subject: `🚨 [IMPORTANT NOTICE] ${title} - ${societyName}`,
    html,
  });
}
