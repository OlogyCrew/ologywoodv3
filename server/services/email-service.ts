import sgMail from "@sendgrid/mail";

export interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    type: string;
  }>;
}

export interface ContractShareEmailData {
  recipientEmail: string;
  recipientName: string;
  contractTitle: string;
  contractId: number;
  senderName: string;
  message?: string;
  contractUrl: string;
  pdfAttachment?: {
    filename: string;
    content: Buffer;
  };
}

export class EmailService {
  private static initialized = false;

  /**
   * Initialize SendGrid with API key
   */
  static initialize(apiKey: string): void {
    if (!apiKey) {
      console.warn(
        "[EmailService] SendGrid API key not configured. Email sending will be disabled."
      );
      return;
    }

    sgMail.setApiKey(apiKey);
    this.initialized = true;
    console.log("[EmailService] SendGrid initialized successfully");
  }

  /**
   * Send a generic email
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.initialized) {
      console.warn(
        "[EmailService] Email service not initialized. Skipping email send."
      );
      return;
    }

    try {
      const msg: any = {
        to: options.to,
        from: process.env.SENDGRID_FROM_EMAIL || "noreply@ologywood.com",
        subject: options.subject,
        html: options.htmlContent,
        text: options.textContent,
      };

      if (options.attachments && options.attachments.length > 0) {
        msg.attachments = options.attachments.map((att) => ({
          filename: att.filename,
          content: att.content.toString("base64"),
          type: att.type,
          disposition: "attachment",
        }));
      }

      await sgMail.send(msg);
      console.log(
        `[EmailService] Email sent successfully to ${options.to}`
      );
    } catch (error) {
      console.error("[EmailService] Failed to send email:", error);
      throw error;
    }
  }

  /**
   * Send contract share notification email
   */
  static async sendContractShareEmail(
    data: ContractShareEmailData
  ): Promise<void> {
    const htmlContent = this.generateContractShareEmailHTML(data);
    const textContent = this.generateContractShareEmailText(data);

    const attachments = [];
    if (data.pdfAttachment) {
      attachments.push({
        filename: data.pdfAttachment.filename,
        content: data.pdfAttachment.content,
        type: "application/pdf",
      });
    }

    await this.sendEmail({
      to: data.recipientEmail,
      subject: `Contract Shared: ${data.contractTitle}`,
      htmlContent,
      textContent,
      attachments,
    });
  }

  /**
   * Send contract signed notification email
   */
  static async sendContractSignedEmail(
    recipientEmail: string,
    contractTitle: string,
    contractId: number,
    signerName: string
  ): Promise<void> {
    const htmlContent = `
      <h2>Contract Signed</h2>
      <p>The contract "<strong>${contractTitle}</strong>" has been signed by <strong>${signerName}</strong>.</p>
      <p><strong>Contract ID:</strong> #${contractId}</p>
      <p>Status: <strong style="color: green;">Signed</strong></p>
      <p>Next steps will be communicated shortly.</p>
    `;

    const textContent = `Contract Signed\n\nThe contract "${contractTitle}" has been signed by ${signerName}.\n\nContract ID: #${contractId}\nStatus: Signed`;

    await this.sendEmail({
      to: recipientEmail,
      subject: `Contract Signed: ${contractTitle}`,
      htmlContent,
      textContent,
    });
  }

  /**
   * Send contract executed notification email
   */
  static async sendContractExecutedEmail(
    recipientEmail: string,
    contractTitle: string,
    contractId: number
  ): Promise<void> {
    const htmlContent = `
      <h2>Contract Executed</h2>
      <p>The contract "<strong>${contractTitle}</strong>" has been executed and is now active.</p>
      <p><strong>Contract ID:</strong> #${contractId}</p>
      <p>Status: <strong style="color: green;">Executed</strong></p>
      <p>All parties have agreed to the terms. The contract is now in effect.</p>
    `;

    const textContent = `Contract Executed\n\nThe contract "${contractTitle}" has been executed and is now active.\n\nContract ID: #${contractId}\nStatus: Executed`;

    await this.sendEmail({
      to: recipientEmail,
      subject: `Contract Executed: ${contractTitle}`,
      htmlContent,
      textContent,
    });
  }

  /**
   * Send contract reminder email for unsigned contracts
   */
  static async sendContractReminderEmail(
    recipientEmail: string,
    recipientName: string,
    contractTitle: string,
    contractId: number,
    contractUrl: string,
    daysRemaining: number
  ): Promise<void> {
    const htmlContent = `
      <h2>Reminder: Unsigned Contract</h2>
      <p>Hi ${recipientName},</p>
      <p>You have an unsigned contract awaiting your review and signature.</p>
      <p><strong>Contract:</strong> ${contractTitle}</p>
      <p><strong>Contract ID:</strong> #${contractId}</p>
      <p><strong>Days Remaining:</strong> ${daysRemaining}</p>
      <p><a href="${contractUrl}" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Review & Sign Contract</a></p>
      <p>Please sign this contract at your earliest convenience.</p>
    `;

    const textContent = `Reminder: Unsigned Contract\n\nHi ${recipientName},\n\nYou have an unsigned contract awaiting your review and signature.\n\nContract: ${contractTitle}\nContract ID: #${contractId}\nDays Remaining: ${daysRemaining}\n\nReview and sign: ${contractUrl}`;

    await this.sendEmail({
      to: recipientEmail,
      subject: `Reminder: Sign ${contractTitle}`,
      htmlContent,
      textContent,
    });
  }

  /**
   * Generate HTML content for contract share email
   */
  private static generateContractShareEmailHTML(
    data: ContractShareEmailData
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Contract Shared</h2>
        <p>Hi ${data.recipientName},</p>
        <p>${data.senderName} has shared a contract with you for review and signature.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Contract:</strong> ${data.contractTitle}</p>
          <p><strong>Contract ID:</strong> #${data.contractId}</p>
          ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ""}
        </div>
        
        <p><a href="${data.contractUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Review & Sign Contract</a></p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          A PDF copy of the contract is attached to this email for your reference.
        </p>
      </div>
    `;
  }

  /**
   * Generate text content for contract share email
   */
  private static generateContractShareEmailText(
    data: ContractShareEmailData
  ): string {
    return `
Contract Shared

Hi ${data.recipientName},

${data.senderName} has shared a contract with you for review and signature.

Contract: ${data.contractTitle}
Contract ID: #${data.contractId}
${data.message ? `Message: ${data.message}` : ""}

Review and sign the contract here: ${data.contractUrl}

A PDF copy of the contract is attached to this email for your reference.
    `.trim();
  }
}

// Initialize email service on module load
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (sendgridApiKey) {
  EmailService.initialize(sendgridApiKey);
}
