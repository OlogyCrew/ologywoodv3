import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Copy, Edit2, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";

interface Template {
  id: number;
  name: string;
  artistType: string;
  contractType: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

const ARTIST_TYPES = [
  "Musicians/Bands",
  "Comedians",
  "Dancers/Choreographers",
  "Magicians/Illusionists",
  "Speakers/Presenters",
  "DJs",
  "Acrobats/Circus Acts",
  "Tribute Bands",
];

const MOCK_TEMPLATES: Template[] = [
  {
    id: 1,
    name: "Musicians/Bands Rider",
    artistType: "Musicians/Bands",
    contractType: "Rider",
    description: "Professional Ryder for musicians and bands with sound, stage, and technical specifications",
    createdAt: "2026-01-15",
    updatedAt: "2026-01-19",
    usageCount: 5,
  },
  {
    id: 2,
    name: "Comedians Performance Contract",
    artistType: "Comedians",
    contractType: "Performance Contract",
    description: "Standard contract for comedy performances with audience and technical requirements",
    createdAt: "2026-01-16",
    updatedAt: "2026-01-18",
    usageCount: 3,
  },
  {
    id: 3,
    name: "DJs Equipment Rider",
    artistType: "DJs",
    contractType: "Rider",
    description: "DJ equipment specifications and technical requirements for performances",
    createdAt: "2026-01-17",
    updatedAt: "2026-01-19",
    usageCount: 7,
  },
];

export default function ContractTemplates() {
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArtistType, setFilterArtistType] = useState<string | null>(null);
  const [filterContractType, setFilterContractType] = useState<string | null>(null);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArtistType = !filterArtistType || template.artistType === filterArtistType;
    const matchesContractType = !filterContractType || template.contractType === filterContractType;

    return matchesSearch && matchesArtistType && matchesContractType;
  });

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Math.max(...templates.map((t) => t.id), 0) + 1,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      usageCount: 0,
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleDelete = (id: number) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Contract Templates Library</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize contract templates by artist type
            </p>
          </div>
          <Link href="/contracts/templates/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterArtistType || ""} onValueChange={(v) => setFilterArtistType(v || null)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by artist type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Artist Types</SelectItem>
                  {ARTIST_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterContractType || ""} onValueChange={(v) => setFilterContractType(v || null)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by contract type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Contract Types</SelectItem>
                  <SelectItem value="Rider">Rider</SelectItem>
                  <SelectItem value="Performance Contract">Performance Contract</SelectItem>
                  <SelectItem value="Service Agreement">Service Agreement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <div className="space-y-4">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.contractType}</Badge>
                        <Badge className="bg-blue-100 text-blue-800">{template.artistType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                        <span className="font-medium">Used {template.usageCount} times</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" title="Preview template">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="Edit template">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(template)}
                        title="Duplicate template"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  No templates found matching your criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Templates Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Templates Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-3xl font-bold">{templates.length}</p>
                <p className="text-sm text-muted-foreground">Total Templates</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-3xl font-bold">{new Set(templates.map((t) => t.artistType)).size}</p>
                <p className="text-sm text-muted-foreground">Artist Types</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-3xl font-bold">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Uses</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-3xl font-bold">
                  {Math.round(templates.reduce((sum, t) => sum + t.usageCount, 0) / templates.length)}
                </p>
                <p className="text-sm text-muted-foreground">Average Uses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
