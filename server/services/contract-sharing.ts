import { db } from "@/server/db";
import { ContractPDFGenerator, type ContractPDFData } from "./pdf-generator";
import { Readable } from "stream";

export interface ContractShareData {
  contractId: number;
  recipientEmail: string;
  recipientName: string;
  message?: string;
  expiresAt?: Date;
}

export interface ShareHistory {
  id: number;
  contractId: number;
  sharedBy: string;
  sharedWith: string;
  sharedAt: Date;
  readAt?: Date;
  signedAt?: Date;
  message?: string;
}

export class ContractSharingService {
  /**
   * Share a contract with an artist via email
   */
  static async shareContract(
    contractId: number,
    shareData: ContractShareData
  ): Promise<{ success: boolean; shareId: number; message: string }> {
    try {
      // Get contract from database
      const contract = await db.getContractById(contractId);

      if (!contract) {
        throw new Error("Contract not found");
      }

      // Create share record in database
      const shareId = await this.createShareRecord(contractId, shareData);

      // Generate PDF
      const pdfStream = this.generateContractPDF(contract);

      // Send email with PDF attachment
      await this.sendShareEmail(
        shareData.recipientEmail,
        shareData.recipientName,
        contract,
        pdfStream,
        shareData.message
      );

      // Update contract status
      await this.updateContractStatus(contractId, "sent");

      return {
        success: true,
        shareId,
        message: `Contract shared successfully with ${shareData.recipientName}`,
      };
    } catch (error) {
      console.error("Error sharing contract:", error);
      throw error;
    }
  }

  /**
   * Create a share record in the database
   */
  private static async createShareRecord(
    contractId: number,
    shareData: ContractShareData
  ): Promise<number> {
    // This would typically insert into a contract_shares table
    // For now, we'll return a mock ID
    const shareId = Math.floor(Math.random() * 10000);
    console.log(
      `[ContractSharing] Created share record #${shareId} for contract #${contractId}`
    );
    return shareId;
  }

  /**
   * Generate PDF for contract
   */
  private static generateContractPDF(contract: any): Readable {
    const contractData: ContractPDFData = {
      contractId: contract.id,
      title: contract.contractData?.title || contract.title || "Contract",
      contractType: contract.contractType || "Rider",
      description: contract.contractData?.description || "",
      terms: contract.contractData?.terms || "",
      createdAt: contract.createdAt || new Date(),
      status: contract.status || "Draft",
      artistName: contract.artistName,
      venueName: contract.venueName,
    };

    return ContractPDFGenerator.generatePDF(contractData);
  }

  /**
   * Send share email with PDF attachment
   */
  private static async sendShareEmail(
    recipientEmail: string,
    recipientName: string,
    contract: any,
    pdfStream: Readable,
    message?: string
  ): Promise<void> {
    // This would integrate with SendGrid or similar email service
    // For now, we'll log the action
    console.log(`[ContractSharing] Sending contract email to ${recipientEmail}`);
    console.log(`[ContractSharing] Contract: ${contract.title}`);
    console.log(`[ContractSharing] Recipient: ${recipientName}`);
    if (message) {
      console.log(`[ContractSharing] Message: ${message}`);
    }

    // In production, this would:
    // 1. Convert PDF stream to buffer
    // 2. Send via SendGrid with PDF attachment
    // 3. Log email delivery status
  }

  /**
   * Update contract status
   */
  private static async updateContractStatus(
    contractId: number,
    status: string
  ): Promise<void> {
    console.log(
      `[ContractSharing] Updated contract #${contractId} status to: ${status}`
    );
    // This would update the contract status in the database
  }

  /**
   * Mark contract as read by recipient
   */
  static async markAsRead(shareId: number): Promise<void> {
    console.log(`[ContractSharing] Marked share #${shareId} as read`);
    // Update read timestamp in database
  }

  /**
   * Mark contract as signed by recipient
   */
  static async markAsSigned(
    shareId: number,
    signature: string
  ): Promise<void> {
    console.log(`[ContractSharing] Marked share #${shareId} as signed`);
    // Update signature and timestamp in database
  }

  /**
   * Get share history for a contract
   */
  static async getShareHistory(contractId: number): Promise<ShareHistory[]> {
    console.log(`[ContractSharing] Getting share history for contract #${contractId}`);
    // Query database for all shares of this contract
    return [];
  }

  /**
   * Get share details by ID
   */
  static async getShareDetails(shareId: number): Promise<ShareHistory | null> {
    console.log(`[ContractSharing] Getting share details for share #${shareId}`);
    // Query database for specific share
    return null;
  }

  /**
   * Revoke a shared contract
   */
  static async revokeShare(shareId: number): Promise<void> {
    console.log(`[ContractSharing] Revoked share #${shareId}`);
    // Mark share as revoked in database
  }

  /**
   * Send reminder email for unsigned contract
   */
  static async sendReminderEmail(shareId: number): Promise<void> {
    console.log(`[ContractSharing] Sending reminder email for share #${shareId}`);
    // Query share details and send reminder email
  }
}
