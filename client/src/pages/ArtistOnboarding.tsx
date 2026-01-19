import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Music, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

// Separate component for the onboarding form to avoid hooks order issues
function ArtistOnboardingForm() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Step 1: Basic Info
  const [artistName, setArtistName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  // Step 2: Genre & Performance Details
  const [genreInput, setGenreInput] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [feeRangeMin, setFeeRangeMin] = useState("");
  const [feeRangeMax, setFeeRangeMax] = useState("");
  const [touringPartySize, setTouringPartySize] = useState("1");

  // Step 3: Social Links
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");
  const [spotify, setSpotify] = useState("");

  const uploadPhoto = trpc.artist.uploadPhoto.useMutation({
    onSuccess: (data) => {
      setProfilePhotoUrl(data.url);
      toast.success("Photo uploaded successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload photo");
    },
  });

  const createProfile = trpc.artist.createProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile created successfully!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create profile");
    },
  });

  const handleAddGenre = () => {
    if (genreInput.trim() && !genres.includes(genreInput.trim())) {
      setGenres([...genres, genreInput.trim()]);
      setGenreInput("");
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setGenres(genres.filter(g => g !== genre));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      setProfilePhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!profilePhoto) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      uploadPhoto.mutate({
        fileData: reader.result as string,
        fileName: profilePhoto.name,
        mimeType: profilePhoto.type,
      });
    };
    reader.readAsDataURL(profilePhoto);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!artistName.trim()) {
        toast.error("Please enter your artist name");
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!artistName.trim()) {
      toast.error("Artist name is required");
      return;
    }

    // Upload photo first if one is selected
    if (profilePhoto && !profilePhotoUrl) {
      await handleUploadPhoto();
      // Wait a moment for the upload to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    createProfile.mutate({
      artistName,
      location: location || undefined,
      bio: bio || undefined,
      genre: genres.length > 0 ? genres : undefined,
      feeRangeMin: feeRangeMin ? parseInt(feeRangeMin) : undefined,
      feeRangeMax: feeRangeMax ? parseInt(feeRangeMax) : undefined,
      touringPartySize: parseInt(touringPartySize),
      websiteUrl: websiteUrl || undefined,
      profilePhotoUrl: profilePhotoUrl || undefined,
      socialLinks: {
        instagram: instagram || undefined,
        facebook: facebook || undefined,
        youtube: youtube || undefined,
        spotify: spotify || undefined,
      },
    });
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src="/logo-icon.png" alt="Ologywood" className="h-8 w-8 rounded" />
              <div>
                <CardTitle>Create Your Artist Profile</CardTitle>
                <CardDescription>Step {currentStep} of {totalSteps}</CardDescription>
              </div>
            </div>
            <Music className="h-8 w-8 text-primary" />
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="artistName">Artist Name *</Label>
                <Input
                  id="artistName"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Your stage name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="profilePhoto">Profile Photo</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  {profilePhotoPreview && (
                    <div className="flex gap-4">
                      <img
                        src={profilePhotoPreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded"
                      />
                      <Button
                        onClick={handleUploadPhoto}
                        disabled={uploadPhoto.isPending}
                        variant="outline"
                      >
                        {uploadPhoto.isPending ? "Uploading..." : "Upload Photo"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="genreInput">Genres</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="genreInput"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    placeholder="Enter a genre"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGenre();
                      }
                    }}
                  />
                  <Button onClick={handleAddGenre} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                      <button
                        onClick={() => handleRemoveGenre(genre)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="feeRangeMin">Min Fee ($)</Label>
                  <Input
                    id="feeRangeMin"
                    type="number"
                    value={feeRangeMin}
                    onChange={(e) => setFeeRangeMin(e.target.value)}
                    placeholder="0"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="feeRangeMax">Max Fee ($)</Label>
                  <Input
                    id="feeRangeMax"
                    type="number"
                    value={feeRangeMax}
                    onChange={(e) => setFeeRangeMax(e.target.value)}
                    placeholder="0"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="touringPartySize">Touring Party Size</Label>
                <Input
                  id="touringPartySize"
                  type="number"
                  value={touringPartySize}
                  onChange={(e) => setTouringPartySize(e.target.value)}
                  min="1"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@yourinstagram"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="facebook.com/yourpage"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="youtube.com/@yourchannel"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="spotify">Spotify</Label>
                <Input
                  id="spotify"
                  value={spotify}
                  onChange={(e) => setSpotify(e.target.value)}
                  placeholder="spotify.com/artist/..."
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between gap-4 mt-8">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={createProfile.isPending}>
                {createProfile.isPending ? "Creating..." : "Create Profile"}
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component that handles access control
export default function ArtistOnboarding() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Check if artist already has a profile
  const { data: artistProfile } = trpc.artist.getMyProfile.useQuery(undefined, {
    enabled: !!user && user.role === 'artist',
  });

  // Redirect if artist already has a profile
  useEffect(() => {
    if (!user) {
      return;
    }
    
    if (user.role !== 'artist') {
      setIsLoading(false);
      return;
    }
    
    if (artistProfile) {
      navigate('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [artistProfile, user, navigate]);

  // Show loading state while checking if profile exists
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Redirect non-artists
  if (!user || user.role !== 'artist') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only artists can access the onboarding page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ArtistOnboardingForm />;
}
