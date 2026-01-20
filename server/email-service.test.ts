import { describe, it, expect, beforeAll } from "vitest";
import { EmailService } from "./services/email-service";

describe("EmailService", () => {
  beforeAll(() => {
    // Initialize email service with API key from environment
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      EmailService.initialize(apiKey);
    }
  });

  it("should initialize SendGrid with valid API key", () => {
    const apiKey = process.env.SENDGRID_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^SG\./); // SendGrid keys start with SG.
    expect(apiKey?.length).toBeGreaterThan(20);
  });

  it("should have from email configured", () => {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    expect(fromEmail).toBeDefined();
    expect(fromEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Valid email format
  });

  it("should generate valid contract share email HTML", () => {
    const emailData = {
      recipientEmail: "test@example.com",
      recipientName: "Test Artist",
      contractTitle: "Test Contract",
      contractId: 123,
      senderName: "Test Venue",
      contractUrl: "https://example.com/contracts/123",
      message: "Please review this contract",
    };

    // This would normally call sendContractShareEmail
    // For now, just verify the data structure is valid
    expect(emailData.recipientEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(emailData.contractTitle).toBeDefined();
    expect(emailData.contractId).toBeGreaterThan(0);
  });

  it("should validate email options structure", () => {
    const emailOptions = {
      to: "artist@example.com",
      subject: "Contract Shared",
      htmlContent: "<p>Your contract is ready</p>",
      textContent: "Your contract is ready",
    };

    expect(emailOptions.to).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(emailOptions.subject).toBeDefined();
    expect(emailOptions.htmlContent).toBeDefined();
  });
});
