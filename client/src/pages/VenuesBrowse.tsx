import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Search, MapPin, Users } from "lucide-react";

export default function VenuesBrowse() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all venues - you may need to create this endpoint
  const { data: venues, isLoading } = trpc.venue.search.useQuery({});

  const filteredVenues = venues?.filter(venue => {
    const matchesSearch = searchQuery === "" || 
      venue.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (venue.location && venue.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

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
        <h1 className="text-4xl font-bold mb-8">Browse Venues</h1>
        
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by venue name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading venues...
          </div>
        ) : filteredVenues && filteredVenues.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">
              Showing {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <Link key={venue.id} href={`/venue/${venue.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        {venue.photoUrl ? (
                          <img 
                            src={venue.photoUrl} 
                            alt={venue.venueName}
                            className="w-full h-48 object-cover rounded-md mb-4"
                          />
                        ) : (
                          <div className="w-full h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
                            <Building2 className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                        <CardTitle>{venue.venueName}</CardTitle>
                        <CardDescription>
                          {venue.venueType || "Venue"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {venue.location && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{venue.location}</span>
                            </div>
                          )}
                          {venue.capacity && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>Capacity: {venue.capacity}</span>
                            </div>
                          )}
                          {venue.description && (
                            <p className="text-muted-foreground line-clamp-2 mt-2">
                              {venue.description}
                            </p>
                          )}
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          View Profile
                        </Button>
                      </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No venues found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
