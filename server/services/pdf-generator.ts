import PDFDocument from "pdfkit";
import { Readable } from "stream";

export interface ContractPDFData {
  contractId: number;
  title: string;
  contractType: string;
  description: string;
  terms: string;
  createdAt: Date;
  status: string;
  artistName?: string;
  venueName?: string;
}

export class ContractPDFGenerator {
  /**
   * Generate a professional PDF from contract data
   */
  static generatePDF(contractData: ContractPDFData): Readable {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    // Add header
    this.addHeader(doc);

    // Add title
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text(contractData.title, { align: "center" });

    doc.moveDown(0.5);

    // Add contract metadata
    this.addMetadata(doc, contractData);

    doc.moveDown(1);

    // Add description
    if (contractData.description) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Description", { underline: true });
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(contractData.description, {
          align: "left",
          width: 500,
        });
      doc.moveDown(0.5);
    }

    // Add terms and conditions
    if (contractData.terms) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Terms & Conditions", { underline: true });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(contractData.terms, {
          align: "left",
          width: 500,
        });

      doc.moveDown(1);
    }

    // Add signature section
    this.addSignatureSection(doc);

    // Add footer
    this.addFooter(doc);

    // Finalize PDF
    doc.end();

    return doc;
  }

  /**
   * Add header with company branding
   */
  private static addHeader(doc: PDFDocument): void {
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("OLOGYWOOD", { align: "left" });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Artist Booking Platform", { align: "left" });

    doc.moveTo(50, 100).lineTo(550, 100).stroke();
    doc.moveDown(1);
  }

  /**
   * Add contract metadata
   */
  private static addMetadata(
    doc: PDFDocument,
    contractData: ContractPDFData
  ): void {
    const metadata = [
      { label: "Contract ID", value: `#${contractData.contractId}` },
      { label: "Type", value: contractData.contractType },
      { label: "Status", value: contractData.status },
      {
        label: "Created",
        value: contractData.createdAt.toLocaleDateString(),
      },
    ];

    if (contractData.artistName) {
      metadata.push({ label: "Artist", value: contractData.artistName });
    }

    if (contractData.venueName) {
      metadata.push({ label: "Venue", value: contractData.venueName });
    }

    doc.fontSize(10).font("Helvetica");

    metadata.forEach((item) => {
      doc
        .font("Helvetica-Bold")
        .text(`${item.label}:`, { continued: true })
        .font("Helvetica")
        .text(` ${item.value}`);
    });
  }

  /**
   * Add signature section
   */
  private static addSignatureSection(doc: PDFDocument): void {
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Signatures", { underline: true });

    doc.moveDown(1);

    // Artist signature
    doc.fontSize(10).font("Helvetica").text("Artist Signature:");
    doc.moveTo(50, doc.y + 30).lineTo(250, doc.y + 30).stroke();
    doc.moveDown(2);

    doc.text("Date: _______________");
    doc.moveDown(1.5);

    // Venue signature
    doc.fontSize(10).font("Helvetica").text("Venue Representative Signature:");
    doc.moveTo(50, doc.y + 30).lineTo(250, doc.y + 30).stroke();
    doc.moveDown(2);

    doc.text("Date: _______________");
  }

  /**
   * Add footer with page numbers and disclaimer
   */
  private static addFooter(doc: PDFDocument): void {
    const pages = doc.bufferedPageRange().count;

    for (let i = 0; i < pages; i++) {
      doc.switchToPage(i);

      // Page number
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          `Page ${i + 1} of ${pages}`,
          50,
          doc.page.height - 30,
          { align: "center" }
        );

      // Disclaimer
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          "This is a legally binding contract. Please review carefully before signing.",
          50,
          doc.page.height - 50,
          { align: "center", width: 500 }
        );
    }
  }
}
