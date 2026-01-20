import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Template data for different artist types
const TEMPLATE_DATA: Record<string, { title: string; description: string; terms: string }> = {
  musicians: {
    title: "Musicians/Bands Rider",
    description: "Professional Ryder for musicians and bands with sound, stage, and technical specifications",
    terms: `TECHNICAL REQUIREMENTS
- Sound System: Full PA system with mixing console, microphones, and stage monitors
- Stage Setup: Minimum 20' x 16' stage with 12" elevation
- Lighting: Professional stage lighting with color capabilities (minimum 12 fixtures)
- Power: Dedicated 20-amp circuits (minimum 4 available)
- Load-in Time: 3 hours before performance
- Sound Check: 1 hour minimum

HOSPITALITY REQUIREMENTS
- Dressing room with mirrors and seating for 4-6 people
- Climate control (temperature 68-72°F)
- Complimentary beverages (water, soft drinks, coffee)
- Catering for band members
- Parking for tour bus/vehicles
- Security/crowd control personnel

PAYMENT TERMS
- Performance fee: $[AMOUNT]
- Payment method: [CASH/CHECK/TRANSFER]
- Payment timing: [BEFORE/AFTER] performance
- Deposit required: $[AMOUNT]

INSURANCE & LIABILITY
- Venue liability insurance minimum: $1,000,000
- Artist liability coverage: [REQUIRED/NOT REQUIRED]`
  },
  comedians: {
    title: "Comedians Rider",
    description: "Professional Ryder for comedians with microphone, lighting, and stage requirements",
    terms: `TECHNICAL REQUIREMENTS
- Microphone: Wireless lavalier or handheld mic
- Sound System: Full PA with monitor speakers
- Lighting: Spotlight or stage wash lighting
- Stage: Minimum 12' x 8' with 12" elevation
- Power: Standard 15-amp circuit
- Load-in Time: 1-2 hours before performance

HOSPITALITY REQUIREMENTS
- Private dressing room with mirror and seating
- Climate control
- Complimentary beverages (water, soft drinks)
- Light snacks or catering
- Parking (close to venue)
- Green room for pre-show preparation

PERFORMANCE SPECIFICATIONS
- Show duration: [TIME]
- Audience capacity: [SPECIFY]
- Heckler management policy: [SPECIFY]
- Recording/streaming restrictions: [SPECIFY]

PAYMENT TERMS
- Performance fee: $[AMOUNT]
- Payment method: [CASH/CHECK/TRANSFER]
- Travel reimbursement: [INCLUDED/SEPARATE]`
  },
  dancers: {
    title: "Dancers/Choreographers Rider",
    description: "Professional Ryder for dancers and choreographers with floor and music specifications",
    terms: `TECHNICAL REQUIREMENTS
- Dance Floor: Sprung floor or smooth surface (no carpet)
- Floor Dimensions: Minimum 24' x 20' clear space
- Mirrors: Full-length mirrors on one wall
- Music System: High-quality sound system with aux input
- Lighting: Stage lighting with color capabilities
- Load-in Time: 2-3 hours before performance

HOSPITALITY REQUIREMENTS
- Dressing room with mirrors and seating
- Climate control (temperature 68-72°F)
- Complimentary beverages and snacks
- Catering for dancers (high-protein options)
- Parking for company vehicles

PERFORMANCE SPECIFICATIONS
- Performance duration: [TIME]
- Number of dancers: [X]
- Stage configuration: [SPECIFY]
- Audience seating: [SPECIFY]`
  },
  magicians: {
    title: "Magicians/Illusionists Rider",
    description: "Professional Ryder for magicians and illusionists with rigging and blackout requirements",
    terms: `TECHNICAL REQUIREMENTS
- Stage Dimensions: Minimum 16' x 12' with 12" elevation
- Rigging Points: Overhead rigging capability
- Lighting: Professional stage lighting
- Blackout Capability: Complete stage blackout required
- Power: Dedicated 20-amp circuits (minimum 2)
- Load-in Time: 4-6 hours

HOSPITALITY REQUIREMENTS
- Private dressing room with secure equipment storage
- Climate control
- Complimentary beverages and snacks
- Parking for tour vehicles
- Security for equipment protection

SAFETY REQUIREMENTS
- Insurance: Venue liability $2,000,000 minimum
- Emergency Medical: Paramedics on-site required`
  },
  speakers: {
    title: "Speakers/Presenters Rider",
    description: "Professional Ryder for speakers and presenters with AV and technical support",
    terms: `TECHNICAL REQUIREMENTS
- Podium/Lectern: Professional podium with microphone
- Microphone: Wireless lavalier or handheld
- Sound System: Full PA with monitor speakers
- Projection: Projector and screen
- Lighting: Stage lighting with spotlight
- Load-in Time: 1-2 hours

AV SPECIFICATIONS
- Presentation Format: [POWERPOINT/KEYNOTE/VIDEO]
- Display Resolution: [1080P/4K]
- Connection Type: [HDMI/WIRELESS/USB]
- Technical Support: [VENUE PROVIDED/SPEAKER PROVIDED]

HOSPITALITY REQUIREMENTS
- Green room with seating and refreshments
- Climate control
- Complimentary beverages (water, coffee, tea)
- Light snacks or catering`
  },
  djs: {
    title: "DJs Rider",
    description: "Professional Ryder for DJs with equipment and booth specifications",
    terms: `TECHNICAL REQUIREMENTS
- DJ Booth: Elevated platform (minimum 8' x 6')
- Power Supply: Dedicated 20-amp circuits (minimum 2)
- Mixing Console: Professional DJ mixer
- Turntables/CDJs: [SPECIFY EQUIPMENT]
- Speakers: Professional PA system with subwoofers
- Load-in Time: 1-2 hours

EQUIPMENT SPECIFICATIONS
- Mixer: [BRAND/MODEL]
- Turntables: [VINYL/CDJ/DIGITAL]
- Headphones: [REQUIRED/PROVIDED]
- Music Format: [VINYL/CD/USB/STREAMING]

HOSPITALITY REQUIREMENTS
- DJ booth with comfortable seating
- Climate control
- Complimentary beverages (water, soft drinks, energy drinks)
- Light snacks or catering`
  },
  acrobats: {
    title: "Acrobats/Circus Acts Rider",
    description: "Professional Ryder for acrobats and circus acts with rigging and safety requirements",
    terms: `TECHNICAL REQUIREMENTS
- Rigging System: Professional rigging
- Rigging Points: [X] overhead points
- Stage Dimensions: Minimum 24' x 20'
- Lighting: Professional stage lighting
- Safety Equipment: Crash mats, safety nets
- Load-in Time: 6-8 hours

SAFETY REQUIREMENTS
- Insurance: Venue liability $2,000,000 minimum
- Emergency Medical: Paramedics on-site required
- Safety Certification: [REQUIRED]
- Spotter Personnel: [X] trained spotters required

HOSPITALITY REQUIREMENTS
- Dressing room with secure equipment storage
- Climate control
- Complimentary beverages and high-protein snacks`
  },
  tribute_bands: {
    title: "Tribute Bands Rider",
    description: "Professional Ryder for tribute bands with instrument and licensing specifications",
    terms: `TECHNICAL REQUIREMENTS
- Sound System: Full PA system with mixing console
- Stage Setup: Minimum 24' x 16'
- Lighting: Professional stage lighting
- Power: Dedicated 20-amp circuits (minimum 4)
- Load-in Time: 3-4 hours

INSTRUMENT SPECIFICATIONS
- Drums: [PROVIDED]
- Bass: [PROVIDED]
- Guitars: [PROVIDED]
- Keyboards: [PROVIDED]
- Microphones: [PROVIDED]

HOSPITALITY REQUIREMENTS
- Dressing room with mirrors and seating
- Climate control
- Complimentary beverages and snacks
- Catering for band members
- Parking for tour bus/vehicles

LICENSING & RIGHTS
- Music Licensing: [VENUE RESPONSIBLE/ARTIST RESPONSIBLE]
- Cover Song Rights: [VERIFIED/NOT VERIFIED]`
  }
};

export default function CreateContract() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contractType: "rider",
    artistType: "",
    artistId: "",
    venueId: "",
    terms: "",
  });

  const createContractMutation = trpc.contracts.create.useMutation({
    onSuccess: (data) => {
      toast.success("Contract created successfully!");
      navigate(`/contracts/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create contract: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a contract title");
      return;
    }

    if (formData.title.length < 3) {
      toast.error("Contract title must be at least 3 characters");
      return;
    }

    if (formData.contractType === "rider" && !formData.artistType) {
      toast.warning("Tip: Select an artist type to auto-fill a professional template");
    }

    createContractMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      contractType: formData.contractType,
      artistId: formData.artistId ? parseInt(formData.artistId) : undefined,
      venueId: formData.venueId ? parseInt(formData.venueId) : undefined,
      terms: formData.terms.trim(),
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArtistTypeChange = (value: string) => {
    handleChange("artistType", value);
    
    // Auto-populate template
    if (TEMPLATE_DATA[value]) {
      const template = TEMPLATE_DATA[value];
      setFormData(prev => ({
        ...prev,
        title: template.title,
        description: template.description,
        terms: template.terms
      }));
      toast.success(`Loaded ${template.title} template!`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/contracts")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Create Contract</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Contract</CardTitle>
            <CardDescription>
              Fill in the details below to create a new contract. You can add more details after creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contract Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Contract Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Performance Agreement - John Doe"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              {/* Contract Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Contract Type</Label>
                <Select value={formData.contractType} onValueChange={(value) => handleChange("contractType", value)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rider">Rider</SelectItem>
                    <SelectItem value="service_agreement">Service Agreement</SelectItem>
                    <SelectItem value="performance_contract">Performance Contract</SelectItem>
                    <SelectItem value="booking_agreement">Booking Agreement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Artist Type - Only show when Rider is selected */}
              {formData.contractType === "rider" && (
                <div className="space-y-2">
                  <Label htmlFor="artistType">Artist Type (Select to Auto-Fill Template)</Label>
                  <Select value={formData.artistType} onValueChange={handleArtistTypeChange}>
                    <SelectTrigger id="artistType">
                      <SelectValue placeholder="Select artist type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="musicians">Musicians/Bands</SelectItem>
                      <SelectItem value="comedians">Comedians</SelectItem>
                      <SelectItem value="dancers">Dancers/Choreographers</SelectItem>
                      <SelectItem value="magicians">Magicians/Illusionists</SelectItem>
                      <SelectItem value="speakers">Speakers/Presenters</SelectItem>
                      <SelectItem value="djs">DJs</SelectItem>
                      <SelectItem value="acrobats">Acrobats/Circus Acts</SelectItem>
                      <SelectItem value="tribute_bands">Tribute Bands</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Selecting an artist type will auto-fill the contract with a professional template</p>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the contract..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Artist ID */}
              <div className="space-y-2">
                <Label htmlFor="artistId">Artist ID (Optional)</Label>
                <Input
                  id="artistId"
                  type="number"
                  placeholder="Enter artist ID if applicable"
                  value={formData.artistId}
                  onChange={(e) => handleChange("artistId", e.target.value)}
                />
              </div>

              {/* Venue ID */}
              <div className="space-y-2">
                <Label htmlFor="venueId">Venue ID (Optional)</Label>
                <Input
                  id="venueId"
                  type="number"
                  placeholder="Enter venue ID if applicable"
                  value={formData.venueId}
                  onChange={(e) => handleChange("venueId", e.target.value)}
                />
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  placeholder="Enter contract terms and conditions..."
                  value={formData.terms}
                  onChange={(e) => handleChange("terms", e.target.value)}
                  rows={6}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/contracts")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createContractMutation.isPending}
                  className="flex-1"
                >
                  {createContractMutation.isPending ? "Creating..." : "Create Contract"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Start with a clear, descriptive title for your contract</p>
            <p>• Select the appropriate contract type for your use case</p>
            <p>• For Rider contracts, select an artist type to auto-fill a professional template</p>
            <p>• You can edit all fields before creating the contract</p>
            <p>• You can add signatures and additional details after creation</p>
            <p>• Artist and Venue IDs are optional - you can add them later</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
