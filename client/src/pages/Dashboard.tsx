import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Music, Calendar, MessageSquare, Settings, ArrowLeft, FileText, Star, Heart, TrendingUp, Bell, HelpCircle, Headphones, ChevronDown } from "lucide-react";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import ReviewsTabContent from "@/components/ReviewsTabContent";
import UnreadBadge from "@/components/UnreadBadge";
import { PhotoGalleryManager } from "@/components/PhotoGalleryManager";
import SavedArtistsTab from "@/components/SavedArtistsTab";
import BookingTemplatesTab from "@/components/BookingTemplatesTab";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import VenueCalendar from "@/components/VenueCalendar";
import { ArtistProfileEditor } from "@/components/ArtistProfileEditor";
import { VenueProfileEditor } from "@/components/VenueProfileEditor";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";
import { RiderTemplateBuilder } from "@/components/RiderTemplateBuilder";
import { RiderAnalyticsDashboard } from "@/components/RiderAnalyticsDashboard";
import { Messaging } from "@/components/Messaging";
import { CalendarSync } from "@/components/CalendarSync";
import { NotificationCenter } from "@/components/NotificationCenter";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("bookings");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    analytics: false,
    reviews: false,
    photos: false,
    riderAnalytics: false,
  });

  const { data: artistProfile } = trpc.artist.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'artist',
  });
  
  const { data: venueProfile } = trpc.venue.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'venue',
  });

  const uploadArtistPhotoMutation = trpc.artist.uploadProfilePhoto.useMutation();
  const uploadVenuePhotoMutation = trpc.venue.uploadProfilePhoto.useMutation();
  
  const { data: artistBookings, refetch: refetchArtistBookings } = trpc.booking.getMyArtistBookings.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'artist',
  });
  
  const { data: venueBookings, refetch: refetchVenueBookings } = trpc.booking.getMyVenueBookings.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'venue',
  });
  
  const { data: unreadCount } = trpc.message.getTotalUnreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const updateBookingStatus = trpc.booking.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Booking status updated");
      refetchArtistBookings();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update booking");
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isArtist = user.role === 'artist';
  const isVenue = user.role === 'venue';
  const bookings = isArtist ? artistBookings : venueBookings;
  const hasProfile = isArtist ? artistProfile : venueProfile;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Music className="h-8 w-8" />
            Ologywood
          </Link>
          
          <div className="flex items-center gap-4">
            {unreadCount && unreadCount.count > 0 && (
              <div className="relative">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount.count}
                </Badge>
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {user.name || user.email}
            </span>
            <Badge variant="secondary">
              {isArtist ? 'Artist' : isVenue ? 'Venue' : user.role}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <a href="/" className="no-underline">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </a>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        {/* Profile Setup Warning */}
        {!hasProfile && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                {isArtist 
                  ? "Create your artist profile to start receiving booking requests."
                  : "Create your venue profile to start booking artists."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setActiveTab("profile")}>
                Set Up Profile
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full overflow-x-auto gap-2 bg-transparent border-b border-border">
            {/* ARTIST TABS - 6 TAB STRUCTURE */}
            {isArtist && (
              <>
                {/* Tab 1: Bookings & Availability */}
                <TabsTrigger value="bookings">
                  <Calendar className="h-4 w-4 mr-2" />
                  Bookings & Availability
                </TabsTrigger>

                {/* Tab 2: Profile */}
                <TabsTrigger value="profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>

                {/* Tab 3: Riders */}
                <TabsTrigger value="riders">
                  <FileText className="h-4 w-4 mr-2" />
                  Riders
                </TabsTrigger>

                {/* Tab 4: Performance (consolidated) */}
                <TabsTrigger value="performance">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>

                {/* Tab 5: Messages */}
                <TabsTrigger value="messaging">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>

                {/* Tab 6: Settings */}
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </>
            )}

            {/* VENUE TABS */}
            {isVenue && (
              <>
                <TabsTrigger value="bookings">
                  <Calendar className="h-4 w-4 mr-2" />
                  Bookings
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="saved">
                  <Heart className="h-4 w-4 mr-2" />
                  Saved Artists
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="photos">
                  <Music className="h-4 w-4 mr-2" />
                  Photos
                </TabsTrigger>
                <TabsTrigger value="messaging">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="support">
                  <Headphones className="h-4 w-4 mr-2" />
                  Support
                </TabsTrigger>
              </>
            )}

            {/* Admin Testing Tab (Admin only) */}
            {user?.role === 'admin' && (
              <TabsTrigger value="admin-testing">
                <TrendingUp className="h-4 w-4 mr-2" />
                Admin Testing
              </TabsTrigger>
            )}
          </TabsList>

          {/* ============ ARTIST TABS CONTENT ============ */}

          {/* Tab 1: Bookings & Availability */}
          {isArtist && (
            <TabsContent value="bookings" className="space-y-4">
              {/* Bookings Section */}
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>Manage your upcoming and past performances</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings && bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <Card 
                          key={booking.id} 
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => navigate(`/booking/${booking.id}`)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{booking.venueName}</CardTitle>
                                <CardDescription>
                                  {formatDate(booking.eventDate)}
                                  {booking.eventTime && ` at ${booking.eventTime}`}
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                                <UnreadBadge bookingId={booking.id} />
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {booking.venueAddress && (
                              <p className="text-sm text-muted-foreground mb-2">
                                📍 {booking.venueAddress}
                              </p>
                            )}
                            {booking.totalFee && (
                              <p className="text-sm text-muted-foreground mb-2">
                                💰 ${booking.totalFee}
                              </p>
                            )}
                            {booking.eventDetails && (
                              <p className="text-sm text-muted-foreground mb-4">
                                {booking.eventDetails}
                              </p>
                            )}
                            
                            {isArtist && booking.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm"
                                  onClick={() => updateBookingStatus.mutate({ id: booking.id, status: 'confirmed' })}
                                  disabled={updateBookingStatus.isPending}
                                >
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateBookingStatus.mutate({ id: booking.id, status: 'cancelled' })}
                                  disabled={updateBookingStatus.isPending}
                                >
                                  Decline
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-4">No bookings yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Availability Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Availability</CardTitle>
                      <CardDescription>Click dates to mark your availability</CardDescription>
                    </div>
                    <Link href="/availability">
                      <Button asChild size="sm">
                        <span>Full Calendar View</span>
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <AvailabilityCalendar
                    availability={artistBookings?.map(b => ({
                      date: typeof b.eventDate === 'string' ? b.eventDate : new Date(b.eventDate).toISOString().split('T')[0],
                      status: 'booked' as const
                    })) || []}
                    readOnly
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Tab 2: Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {isArtist && artistProfile?.profilePhotoUrl ? (
                    <img 
                      src={artistProfile.profilePhotoUrl} 
                      alt={artistProfile.artistName}
                      className="h-20 w-20 rounded-full object-cover border-2 border-primary"
                    />
                  ) : isArtist ? (
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Music className="h-10 w-10 text-primary" />
                    </div>
                  ) : isVenue && venueProfile?.profilePhotoUrl ? (
                    <img 
                      src={venueProfile.profilePhotoUrl} 
                      alt={venueProfile.venueName}
                      className="h-20 w-20 rounded-full object-cover border-2 border-primary"
                    />
                  ) : isVenue ? (
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Music className="h-10 w-10 text-primary" />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      {hasProfile 
                        ? "Update your profile information"
                        : "Create your profile to get started"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isArtist && artistProfile ? (
                    <>
                      <ProfilePhotoUpload
                        currentPhotoUrl={artistProfile.profilePhotoUrl || undefined}
                        onUpload={async (fileData, fileName, mimeType) => {
                          try {
                            const result = await uploadArtistPhotoMutation.mutateAsync({
                              fileData,
                              fileName,
                              mimeType,
                            });
                            return result;
                          } catch (error: any) {
                            throw new Error(error.message || 'Failed to upload photo');
                          }
                        }}
                        onSuccess={() => {
                          toast.success('Profile photo updated successfully');
                        }}
                        onError={(error) => {
                          toast.error(error);
                        }}
                      />
                      <ArtistProfileEditor onSave={() => {
                        toast.success('Profile updated successfully');
                      }} />
                    </>
                  ) : isVenue && venueProfile ? (
                    <>
                      <ProfilePhotoUpload
                        currentPhotoUrl={venueProfile.profilePhotoUrl || undefined}
                        onUpload={async (fileData, fileName, mimeType) => {
                          try {
                            const result = await uploadVenuePhotoMutation.mutateAsync({
                              fileData,
                              fileName,
                              mimeType,
                            });
                            return result;
                          } catch (error: any) {
                            throw new Error(error.message || 'Failed to upload photo');
                          }
                        }}
                        onSuccess={() => {
                          toast.success('Profile photo updated successfully');
                        }}
                        onError={(error) => {
                          toast.error(error);
                        }}
                      />
                      <VenueProfileEditor onSave={() => {
                        toast.success('Profile updated successfully');
                      }} />
                    </>
                  ) : (
                    <p className="text-muted-foreground">Loading your profile...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Riders (Artists only) */}
          {isArtist && (
            <TabsContent value="riders">
              <RiderTemplateBuilder />
            </TabsContent>
          )}

          {/* Tab 4: Performance (Artists only - consolidated) */}
          {isArtist && (
            <TabsContent value="performance" className="space-y-4">
              {/* Analytics Section */}
              <Card>
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection('analytics')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Analytics</CardTitle>
                      <CardDescription>Track your profile views and engagement</CardDescription>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform ${expandedSections.analytics ? 'rotate-180' : ''}`}
                    />
                  </div>
                </CardHeader>
                {expandedSections.analytics && (
                  <CardContent>
                    <AnalyticsDashboard />
                  </CardContent>
                )}
              </Card>

              {/* Rider Analytics Section */}
              <Card>
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection('riderAnalytics')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Rider Analytics</CardTitle>
                      <CardDescription>Track your rider performance and acceptance rates</CardDescription>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform ${expandedSections.riderAnalytics ? 'rotate-180' : ''}`}
                    />
                  </div>
                </CardHeader>
                {expandedSections.riderAnalytics && (
                  <CardContent>
                    <RiderAnalyticsDashboard artistId={user?.id || 0} />
                  </CardContent>
                )}
              </Card>

              {/* Reviews Section */}
              <Card>
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection('reviews')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Reviews</CardTitle>
                      <CardDescription>See what venues say about your performances</CardDescription>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform ${expandedSections.reviews ? 'rotate-180' : ''}`}
                    />
                  </div>
                </CardHeader>
                {expandedSections.reviews && (
                  <CardContent>
                    <ReviewsTabContent artistId={artistProfile?.id} />
                  </CardContent>
                )}
              </Card>

              {/* Photos Section */}
              <Card>
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection('photos')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Photos</CardTitle>
                      <CardDescription>Manage your performance photos and media</CardDescription>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform ${expandedSections.photos ? 'rotate-180' : ''}`}
                    />
                  </div>
                </CardHeader>
                {expandedSections.photos && (
                  <CardContent>
                    <PhotoGalleryManager role="artist" />
                  </CardContent>
                )}
              </Card>
            </TabsContent>
          )}

          {/* Tab 5: Messages (Artists only) */}
          {isArtist && (
            <TabsContent value="messaging">
              <Messaging />
            </TabsContent>
          )}

          {/* Tab 6: Settings (Artists only - consolidated) */}
          {isArtist && (
            <TabsContent value="settings" className="space-y-4">
              {/* Notifications Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationCenter />
                </CardContent>
              </Card>

              {/* Subscription Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Subscription</CardTitle>
                      <CardDescription>Manage your Ologywood subscription</CardDescription>
                    </div>
                    <Link href="/subscription">
                      <Button asChild size="sm">
                        <span>View Details</span>
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Subscribe to Ologywood to access all features and start receiving bookings.
                  </p>
                </CardContent>
              </Card>

              {/* Calendar Sync Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Sync</CardTitle>
                  <CardDescription>Sync your availability with external calendars</CardDescription>
                </CardHeader>
                <CardContent>
                  <CalendarSync />
                </CardContent>
              </Card>

              {/* Support Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Support</CardTitle>
                  <CardDescription>Get help from our support team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Need help? Create a support ticket and our team will assist you as soon as possible.
                    </p>
                    <div className="flex gap-2">
                      <Link href="/support">
                        <Button size="sm">View My Tickets</Button>
                      </Link>
                      <Link href="/support/create">
                        <Button size="sm" variant="outline">Create New Ticket</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Help Center</CardTitle>
                  <CardDescription>Find answers to common questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Browse our knowledge base, FAQs, and tutorials.
                    </p>
                    <Link href="/help">
                      <Button size="sm">Go to Help Center</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* ============ VENUE TABS CONTENT ============ */}

          {/* Bookings Tab (Venues) */}
          {isVenue && (
            <TabsContent value="bookings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Requests</CardTitle>
                  <CardDescription>View your booking requests and confirmations</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings && bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <Card 
                          key={booking.id} 
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => navigate(`/booking/${booking.id}`)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{booking.venueName}</CardTitle>
                                <CardDescription>
                                  {formatDate(booking.eventDate)}
                                  {booking.eventTime && ` at ${booking.eventTime}`}
                                </CardDescription>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {booking.venueAddress && (
                              <p className="text-sm text-muted-foreground mb-2">
                                📍 {booking.venueAddress}
                              </p>
                            )}
                            {booking.totalFee && (
                              <p className="text-sm text-muted-foreground mb-2">
                                💰 ${booking.totalFee}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-4">No bookings yet</p>
                      <a href="/browse" className="no-underline">
                        <Button>
                          Browse Artists
                        </Button>
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Calendar Tab (Venues) */}
          {isVenue && (
            <TabsContent value="calendar">
              <VenueCalendar />
            </TabsContent>
          )}

          {/* Saved Artists Tab (Venues) */}
          {isVenue && (
            <TabsContent value="saved">
              <SavedArtistsTab />
            </TabsContent>
          )}

          {/* Templates Tab (Venues) */}
          {isVenue && (
            <TabsContent value="templates">
              <BookingTemplatesTab />
            </TabsContent>
          )}

          {/* Photos Tab (Venues) */}
          {isVenue && (
            <TabsContent value="photos">
              <PhotoGalleryManager role="venue" />
            </TabsContent>
          )}

          {/* Messaging Tab (Venues) */}
          {isVenue && (
            <TabsContent value="messaging">
              <Messaging />
            </TabsContent>
          )}

          {/* Notifications Tab (Venues) */}
          {isVenue && (
            <TabsContent value="notifications">
              <NotificationCenter />
            </TabsContent>
          )}

          {/* Support Tab (Venues) */}
          {isVenue && (
            <TabsContent value="support">
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>Manage your support requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground mb-4">
                      Need help? Create a support ticket and our team will assist you.
                    </p>
                    <div className="flex gap-2">
                      <Link href="/support">
                        <Button>View My Tickets</Button>
                      </Link>
                      <Link href="/support/create">
                        <Button variant="outline">Create New Ticket</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Admin Testing Tab */}
          {user?.role === 'admin' && (
            <TabsContent value="admin-testing">
              <AdminDashboard />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
