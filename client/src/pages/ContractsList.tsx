import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Calendar, Badge } from "lucide-react";

export default function ContractsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  
  // Fetch all contracts
  const { data: contracts, isLoading, error } = trpc.contracts.getAll.useQuery({});
  console.log('[ContractsList] Contracts data:', contracts, 'Loading:', isLoading);
  
  console.log('[ContractsList] Query result:', { contracts, isLoading, error });

  const filteredContracts = contracts?.filter(contract => {
    const contractData = contract.contractData as any;
    const matchesSearch = searchQuery === "" || 
      contractData?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractData?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "executed":
        return "bg-green-100 text-green-800";
      case "signed":
        return "bg-blue-100 text-blue-800";
      case "pending_signatures":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <img src="/logo-icon.png" alt="Ologywood" className="h-8 w-8 rounded" />
            Ologywood
          </Link>
          
          <Link href="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Contracts</h1>
          <Button onClick={() => navigate("/contracts/create")}>
            Create Contract
          </Button>
        </div>
        
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading contracts...
          </div>
        ) : filteredContracts && filteredContracts.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">
              Showing {filteredContracts.length} {filteredContracts.length === 1 ? 'contract' : 'contracts'}
            </p>
            
            <div className="space-y-4">
              {filteredContracts.map((contract) => (
                <Link key={contract.id} href={`/contracts/${contract.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>{(contract.contractData as any)?.title || `Contract #${contract.id}`}</CardTitle>
                          </div>
                          <CardDescription>
                            {(contract.contractData as any)?.description || "No description"}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Created {new Date(contract.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/contracts/${contract.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              No contracts found.
            </p>
            <Button onClick={() => navigate("/contracts/create")}>
              Create Your First Contract
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
