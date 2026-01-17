import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

const faqData = [
  {
    id: 1,
    category: "Getting Started",
    title: "Welcome to Ologywood",
    content: "Ologywood is the premier platform for booking talented artists and performers for your events.\n\n## For Artists\n- Create a professional profile\n- Showcase your talent\n- Receive booking requests\n- Manage your calendar\n- Sign contracts digitally\n- Get paid securely\n\n## For Venues\n- Browse talented performers\n- Send professional contracts\n- Manage bookings\n- Track payments\n- Communicate securely",
  },
  {
    id: 2,
    category: "Contracts",
    title: "Understanding Digital Contracts",
    content: "Digital contracts are legally binding agreements signed electronically.\n\n## What They Include\n- Performance details\n- Payment terms\n- Cancellation policy\n- Technical requirements\n- Hospitality needs\n\n## Benefits\n- Legally binding\n- Instant signatures\n- Audit trail\n- Digital verification\n- Easy to store and retrieve",
  },
  {
    id: 3,
    category: "Contracts",
    title: "How to Sign a Contract",
    content: "## Step 1: Review the Contract\n- Read all terms carefully\n- Check dates and payment\n- Verify requirements\n\n## Step 2: Sign\n- Click the Sign button\n- Draw your signature\n- Confirm your identity\n\n## Step 3: Receive Confirmation\n- Get email confirmation\n- Download signed copy\n- Receive digital certificate",
  },
  {
    id: 4,
    category: "Getting Started",
    title: "Creating Your Rider",
    content: "Your rider is your professional requirements document.\n\n## What to Include\n1. Technical Requirements\n   - Sound system needs\n   - Lighting requirements\n   - Stage setup\n   - Equipment provided\n\n2. Hospitality\n   - Dressing room\n   - Catering\n   - Parking\n   - Guest list\n\n3. Financial Terms\n   - Performance fee\n   - Payment terms\n   - Cancellation policy",
  },
  {
    id: 5,
    category: "Communication",
    title: "Messaging Best Practices",
    content: "## Communication Tips\n- Be professional and courteous\n- Respond promptly\n- Keep important details in writing\n- Use clear language\n- Follow up on agreements\n\n## Message Features\n- Real-time notifications\n- Message history\n- Search conversations\n- Read receipts\n- Typing indicators",
  },
  {
    id: 6,
    category: "Account",
    title: "Setting Up Your Profile",
    content: "## Profile Components\n1. Photo - Professional headshot\n2. Bio - Description of your work\n3. Location - Primary location and travel radius\n4. Rates - Your booking rates\n5. Media - Performance photos and videos\n\n## Tips\n- Use professional photos\n- Write a compelling bio\n- Keep information current\n- Add media to showcase talent",
  },
  {
    id: 7,
    category: "Technical",
    title: "Troubleshooting Guide",
    content: "## Login Issues\n- Check email address\n- Reset password\n- Clear browser cache\n\n## Booking Issues\n- Refresh page\n- Check dashboard\n- Verify booking status\n\n## Payment Issues\n- Verify payment method\n- Check card expiration\n- Try different method\n\n## Contact Support\n- If issues persist, contact our support team",
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...new Set(faqData.map((item) => item.category))];

  const filteredFAQ = faqData.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Help Center</h1>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about Ologywood
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">{item.category}</div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                    {expandedId === item.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>

                {expandedId === item.id && (
                  <CardContent className="pt-0">
                    <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                      {item.content}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No articles found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Support */}
        <Card className="mt-12 bg-blue-50">
          <CardHeader>
            <CardTitle>Can't find what you're looking for?</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
