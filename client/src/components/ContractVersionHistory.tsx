import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Download, RotateCcw } from "lucide-react";

interface Version {
  id: number;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  changesSummary?: string;
  title?: string;
}

interface ContractVersionHistoryProps {
  contractId: number;
  versions: Version[];
  onViewVersion?: (versionNumber: number) => void;
  onRollback?: (versionNumber: number) => void;
  onDownload?: (versionNumber: number) => void;
}

export function ContractVersionHistory({
  contractId,
  versions,
  onViewVersion,
  onRollback,
  onDownload,
}: ContractVersionHistoryProps) {
  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No version history available. Create a new version to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History
        </CardTitle>
        <CardDescription>
          {versions.length} version{versions.length !== 1 ? "s" : ""} of this contract
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">v{version.versionNumber}</Badge>
                  {index === 0 && <Badge className="bg-green-100 text-green-800">Current</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Created on {new Date(version.createdAt).toLocaleDateString()} at{" "}
                  {new Date(version.createdAt).toLocaleTimeString()} by {version.createdBy}
                </p>
                {version.changesSummary && (
                  <p className="text-sm text-foreground">{version.changesSummary}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewVersion?.(version.versionNumber)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload?.(version.versionNumber)}
                  title="Download as PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {index > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRollback?.(version.versionNumber)}
                    title="Rollback to this version"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
