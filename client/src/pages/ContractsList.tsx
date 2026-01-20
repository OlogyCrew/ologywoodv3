import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Calendar, Badge, Filter } from "lucide-react";

export default function ContractsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [, navigate] = useLocation();
  
  // Fetch all contracts
  const { data: contracts, isLoading, error } = trpc.contracts.getAll.useQuery({});
  
  const filteredContracts = useMemo(() => {
    return contracts?.filter(contract => {
      const contractData = contract.contractData as any;
      
      // Search filter
      const matchesSearch = searchQuery === "" || 
        contractData?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contractData?.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
      
      // Type filter
      const matchesType = typeFilter === "all" || contractData?.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    }) || [];
  }, [contracts, searchQuery, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "executed":
        return "bg-green-100 text-green-800 border-green-200";
      case "signed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "sent":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "rider":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "service_agreement":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "performance_contract":
        return "bg-pink-50 text-pink-700 border-pink-200";
      case "booking_agreement":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "rider":
        return "Rider";
      case "service_agreement":
        return "Service Agreement";
      case "performance_contract":
        return "Performance Contract";
      case "booking_agreement":
        return "Booking Agreement";
      default:
        return "Other";
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "signed", label: "Signed" },
    { value: "executed", label: "Executed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "rider", label: "Rider" },
    { value: "service_agreement", label: "Service Agreement" },
    { value: "performance_contract", label: "Performance Contract" },
    { value: "booking_agreement", label: "Booking Agreement" },
    { value: "other", label: "Other" },
  ];

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
        {/* Title and Create Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Contracts</h1>
            <p className="text-muted-foreground">
              Manage your artist contracts and agreements
            </p>
          </div>
          <Button 
            onClick={() => navigate("/contracts/create")}
            size="lg"
            className="gap-2"
          >
            <FileText className="h-5 w-5" />
            Create Contract
          </Button>
        </div>

        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p>Loading contracts...</p>
          </div>
        ) : filteredContracts && filteredContracts.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground font-medium">
                Showing <span className="text-foreground font-bold">{filteredContracts.length}</span> {filteredContracts.length === 1 ? 'contract' : 'contracts'}
              </p>
              {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {filteredContracts.map((contract) => {
                const contractData = contract.contractData as any;
                return (
                  <Link key={contract.id} href={`/contracts/${contract.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              <CardTitle className="truncate">
                                {contractData?.title || `Contract #${contract.id}`}
                              </CardTitle>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {contractData?.description || "No description provided"}
                            </CardDescription>
                            
                            {/* Badges */}
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              {contractData?.type && (
                                <Badge className={`border ${getTypeColor(contractData.type)}`}>
                                  {getTypeLabel(contractData.type)}
                                </Badge>
                              )}
                              <Badge className={`border ${getStatusColor(contract.status)}`}>
                                {getStatusLabel(contract.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg mb-2">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "No contracts match your filters."
                : "No contracts yet."}
            </p>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Create your first contract to get started."}
            </p>
            <Button 
              onClick={() => navigate("/contracts/create")}
              size="lg"
              className="gap-2"
            >
              <FileText className="h-5 w-5" />
              Create Your First Contract
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
