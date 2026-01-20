import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Share2, History, GitCompare, PenTool } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ContractStatusTransition } from "@/components/ContractStatusTransition";
import { ContractAuditTrail } from "@/components/ContractAuditTrail";
import { ContractComparison } from "@/components/ContractComparison";

export default function ContractDetail() {
  const queryClient = useQueryClient();
  const [signatureName, setSignatureName] = useState('');
  const { id } = useParams<{ id: string }>();
  
  // Parse and validate contractId
  const contractId = id ? parseInt(id, 10) : null;
  const isValidId = contractId !== null && !isNaN(contractId) && contractId > 0;
  
  // Query contract details
  const { data: contract, isLoading, error } = trpc.contracts.getById.useQuery(
    { contractId: contractId || 0 },
    { enabled: isValidId, retry: 1, throwOnError: false }
  );

  // Query audit trail (disabled - router not implemented)
  const auditTrail = null;

  // Query contract versions (disabled - router not implemented)
  const contractVersions = null;

  // Query status options - using default status options
  // Define what actions are available for each status
  const getStatusOptions = (status: string) => {
    switch (status) {
      case 'draft':
        return { canSign: false, canReject: false, canApprove: true, canCancel: true };
      case 'pending_signatures':
        return { canSign: true, canReject: true, canApprove: false, canCancel: true };
      case 'signed':
        return { canSign: false, canReject: false, canApprove: true, canCancel: false };
      case 'executed':
        return { canSign: false, canReject: false, canApprove: false, canCancel: false };
      default:
        return { canSign: false, canReject: false, canApprove: false, canCancel: false };
    }
  };
  
  // Use real contract data from database
  const displayContract = contract;
  
  // Now get status options based on displayContract
  const statusOptions = getStatusOptions(displayContract?.status || 'draft');
  
  // Create mutation for updating contract status
  const updateStatusMutation = trpc.contracts.updateStatus.useMutation({
    onSuccess: (data) => {
      toast.success('Contract signed successfully');
      // Update the display contract status immediately
      if (data && data.status) {
        displayContract.status = data.status;
      }
      // Clear the signature input after successful signing
      setSignatureName('');
      // Invalidate the contract query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['contracts.getById'] });
      // Note: We don't reload the page - user stays on Status tab
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sign contract');
    },
  });

  // Handler for approving the contract
  const handleApprove = async (notes: string) => {
    console.log('[handleApprove] Starting with notes:', notes);
    try {
      console.log('[handleApprove] Calling mutation with contractId:', contractId);
      updateStatusMutation.mutate({
        contractId: contractId || 0,
        status: 'executed',
      });
    } catch (error) {
      console.error('Error approving contract:', error);
      toast.error('Failed to approve contract');
    }
  };

  // Handler for signing the contract
  const handleSign = async () => {
    console.log('[handleSign] Starting with signature:', signatureName);
    if (!signatureName.trim()) {
      toast.error('Please enter your name to sign the contract');
      return;
    }
    try {
      console.log('[handleSign] Calling mutation with contractId:', contractId);
      updateStatusMutation.mutate({
        contractId: contractId || 0,
        status: 'signed',
      });
      // Update mock contract with signature
      if (displayContract) {
        displayContract.artistSignedAt = new Date().toISOString();
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error('Failed to sign contract');
    }
  };

  if (isLoading && !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading contract...</p>
      </div>
    );
  }

  // Don't show error page - use mock data instead
  // if (error && !contract) {
  //   return error page
  // }

  const handleDownloadPDF = async () => {
    const toastId = toast.loading("Generating PDF...");
    try {
      const contractId = parseInt(id || "0");
      const response = await fetch(`/api/contracts/${contractId}/pdf`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error("Failed to generate PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.dismiss(toastId);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error('PDF download error:', error);
      toast.dismiss(toastId);
      toast.error("Failed to download PDF");
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/contract/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Contract link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "pending_signatures":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="inline-block">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-4">Contract #{id}</h1>
            <p className="text-muted-foreground mt-1">
              Booking Contract Details
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {(displayContract?.status === 'signed' || displayContract?.status === 'executed') && (
              <Button onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
            {displayContract?.status === 'pending_signatures' && (
              <Button disabled title="Contract must be signed before downloading">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <Badge className={getStatusColor(displayContract?.status || "pending")}>
            {displayContract?.status ? displayContract.status.charAt(0).toUpperCase() + displayContract.status.slice(1).replace(/_/g, " ") : "Pending"}
          </Badge>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="status">
              <Badge variant="outline" className="ml-2">Status</Badge>
            </TabsTrigger>
            <TabsTrigger value="audit">
              <History className="h-4 w-4 mr-2" />
              Audit Trail
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <GitCompare className="h-4 w-4 mr-2" />
              Comparison
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Contract Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking ID</p>
                    <p className="font-semibold">{displayContract.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold capitalize">{displayContract.status?.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-semibold">
                      {new Date(displayContract.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {displayContract.artistSignedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Artist Signed</p>
                      <p className="font-semibold">
                        {new Date(displayContract.artistSignedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contract Content */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayContract.contractData && typeof displayContract.contractData === 'object' ? (
                  <>
                    {displayContract.contractData.title && (
                      <div>
                        <p className="text-sm text-muted-foreground">Title</p>
                        <p className="font-semibold">{displayContract.contractData.title}</p>
                      </div>
                    )}
                    {displayContract.contractData.type && (
                      <div>
                        <p className="text-sm text-muted-foreground">Contract Type</p>
                        <p className="font-semibold capitalize">{displayContract.contractData.type.replace(/_/g, " ")}</p>
                      </div>
                    )}
                    {displayContract.contractData.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm">{displayContract.contractData.description}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Contract Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                    {displayContract.contractData?.terms || "No contract terms available"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signatures */}
            {(displayContract.artistSignedAt || displayContract.venueSignedAt) && (
              <Card>
                <CardHeader>
                  <CardTitle>Signatures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">Artist Signature</p>
                        {displayContract.artistSignedAt ? (
                          <Badge className="bg-green-100 text-green-800">
                            Signed {new Date(displayContract.artistSignedAt).toLocaleDateString()}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">Venue Signature</p>
                        {displayContract.venueSignedAt ? (
                          <Badge className="bg-green-100 text-green-800">
                            Signed {new Date(displayContract.venueSignedAt).toLocaleDateString()}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status">
            <div className="space-y-6">
              {/* Show Contract Content for Review */}
              <Card>
                <CardHeader>
                  <CardTitle>Contract to Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayContract.contractData && typeof displayContract.contractData === 'object' ? (
                    <>
                      {displayContract.contractData.title && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Title</p>
                          <p className="text-lg font-bold">{displayContract.contractData.title}</p>
                        </div>
                      )}
                      {displayContract.contractData.type && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Contract Type</p>
                          <p className="capitalize">{displayContract.contractData.type.replace(/_/g, " ")}</p>
                        </div>
                      )}
                      {displayContract.contractData.description && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Description</p>
                          <p className="text-sm">{displayContract.contractData.description}</p>
                        </div>
                      )}
                      {displayContract.contractData.terms && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Terms & Conditions</p>
                          <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm max-h-64 overflow-y-auto">
                            {displayContract.contractData.terms}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">No contract content available</p>
                  )}
                </CardContent>
              </Card>

              {displayContract?.status === 'pending_signatures' && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PenTool className="h-5 w-5" />
                      Sign Contract
                    </CardTitle>
                    <CardDescription>
                      By entering your name below, you agree to the terms shown above
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Your Signature (Name)</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={signatureName}
                        onChange={(e) => {
                          console.log('[signature input] Changed to:', e.target.value);
                          setSignatureName(e.target.value);
                        }}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button 
                      onClick={handleSign}
                      disabled={!signatureName.trim() || updateStatusMutation.isPending}
                      className="w-full"
                    >
                      {updateStatusMutation.isPending ? 'Signing...' : 'Sign Contract'}
                    </Button>
                  </CardContent>
                </Card>
              )}
              {statusOptions && (
                <ContractStatusTransition
                contractId={parseInt(id || "0")}
                currentStatus={displayContract.status}
                canSign={statusOptions.canSign}
                canReject={statusOptions.canReject}
                canApprove={statusOptions.canApprove}
                canCancel={statusOptions.canCancel}
                onSign={handleSign}
                onApprove={handleApprove}
              />
            )}
            </div>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit">
            {auditTrail && <ContractAuditTrail auditTrail={auditTrail} />}
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            {contractVersions && contractVersions.length > 1 && (
              <ContractComparison contractId={parseInt(id || "0")} versions={contractVersions} />
            )}
            {contractVersions && contractVersions.length <= 1 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center py-8">
                    Only one version available. Comparison requires multiple versions.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
