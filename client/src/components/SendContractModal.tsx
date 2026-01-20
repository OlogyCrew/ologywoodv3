import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SendContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: number;
  contractTitle: string;
  onSend?: (data: SendContractData) => Promise<void>;
}

export interface SendContractData {
  recipientEmail: string;
  recipientName: string;
  message?: string;
}

export function SendContractModal({
  open,
  onOpenChange,
  contractId,
  contractTitle,
  onSend,
}: SendContractModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SendContractData>({
    recipientEmail: "",
    recipientName: "",
    message: "",
  });

  const handleChange = (
    field: keyof SendContractData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.recipientEmail.trim()) {
      toast.error("Please enter recipient email");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!formData.recipientName.trim()) {
      toast.error("Please enter recipient name");
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (onSend) {
        await onSend(formData);
      }

      toast.success(
        `Contract sent to ${formData.recipientName}!`
      );

      // Reset form and close modal
      setFormData({
        recipientEmail: "",
        recipientName: "",
        message: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending contract:", error);
      toast.error("Failed to send contract. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Contract
          </DialogTitle>
          <DialogDescription>
            Share "{contractTitle}" with an artist or venue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipient Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="artist@example.com"
              value={formData.recipientEmail}
              onChange={(e) => handleChange("recipientEmail", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Recipient Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Recipient Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.recipientName}
              onChange={(e) => handleChange("recipientName", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to include with the contract..."
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              ℹ️ A professional PDF of the contract will be sent via email along
              with a secure link to review and sign.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Contract
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
