import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Plus, Edit2, Trash2, Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface RiderTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
  sections: {
    technical: boolean;
    hospitality: boolean;
    logistical: boolean;
  };
}

interface RiderSection {
  title: string;
  description: string;
  fields: RiderField[];
}

interface RiderField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'checkbox' | 'select';
  value: string | boolean;
  required: boolean;
  options?: string[];
}

export function RiderTemplateManager() {
  const [templates, setTemplates] = useState<RiderTemplate[]>([
    {
      id: '1',
      name: 'Standard Artist Rider',
      description: 'Complete rider template with technical, hospitality, and logistical requirements',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true,
      sections: {
        technical: true,
        hospitality: true,
        logistical: true,
      },
    },
    {
      id: '2',
      name: 'Solo Performer Rider',
      description: 'Simplified rider for solo artists and acoustic performers',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false,
      sections: {
        technical: true,
        hospitality: true,
        logistical: false,
      },
    },
    {
      id: '3',
      name: 'Band Rider',
      description: 'Comprehensive rider for full bands with detailed technical requirements',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false,
      sections: {
        technical: true,
        hospitality: true,
        logistical: true,
      },
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<RiderTemplate | null>(templates[0]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    const newTemplate: RiderTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      description: newTemplateDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false,
      sections: {
        technical: true,
        hospitality: true,
        logistical: true,
      },
    };

    setTemplates([...templates, newTemplate]);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setShowCreateForm(false);
    toast.success('Rider template created successfully');
  };

  const handleDeleteTemplate = (id: string) => {
    if (templates.length === 1) {
      toast.error('Cannot delete the last template');
      return;
    }

    setTemplates(templates.filter(t => t.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(templates[0]);
    }
    toast.success('Rider template deleted');
  };

  const handleDuplicateTemplate = (template: RiderTemplate) => {
    const duplicated: RiderTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false,
    };

    setTemplates([...templates, duplicated]);
    toast.success('Rider template duplicated');
  };

  const handleDownloadTemplate = (template: RiderTemplate) => {
    const content = generateRiderContent(template);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `${template.name.replace(/\s+/g, '_')}_Rider.md`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Rider template downloaded');
  };

  const generateRiderContent = (template: RiderTemplate): string => {
    let content = `# ${template.name}\n\n`;
    content += `**Description:** ${template.description}\n\n`;
    content += `**Created:** ${template.createdAt.toLocaleDateString()}\n\n`;
    content += `---\n\n`;

    if (template.sections.technical) {
      content += `## Technical Requirements\n\n`;
      content += `### Stage Plot & Layout\n`;
      content += `- Position of each performer/band member\n`;
      content += `- Location of all instruments and amplifiers\n`;
      content += `- Monitor speaker placement\n`;
      content += `- Drum riser specifications (if needed)\n\n`;

      content += `### Audio Input List\n`;
      content += `- Kick Drum: Beta 52 or similar dynamic\n`;
      content += `- Snare Top: SM57 or equivalent\n`;
      content += `- Lead Vocals: SM58 or Beta 58\n`;
      content += `- Acoustic Guitar: DI Box or Condenser\n\n`;

      content += `### Equipment Requirements\n`;
      content += `**Sound System:**\n`;
      content += `- Minimum PA System Power: [Specify]\n`;
      content += `- Mixing Console: [Specify]\n`;
      content += `- Monitor System: [Specify]\n\n`;
    }

    if (template.sections.hospitality) {
      content += `## Hospitality Requirements\n\n`;
      content += `### Dressing Room\n`;
      content += `- Minimum room size: [Specify]\n`;
      content += `- Privacy requirements: Lockable door\n`;
      content += `- Climate control: Heating and air conditioning\n`;
      content += `- Furnishings: Mirrors, seating, tables\n\n`;

      content += `### Food & Catering\n`;
      content += `- Dietary restrictions: [Specify]\n`;
      content += `- Hot meal timing: [Specify]\n`;
      content += `- Meal buyout option: $[Amount] per person\n\n`;

      content += `### Beverages\n`;
      content += `- Bottled water: 24 bottles\n`;
      content += `- Soft drinks: 12 cans\n`;
      content += `- Coffee and tea: Available\n\n`;
    }

    if (template.sections.logistical) {
      content += `## Logistical Requirements\n\n`;
      content += `### Guest List & Complimentary Tickets\n`;
      content += `- Number of complimentary tickets: [Specify]\n`;
      content += `- VIP or backstage access passes: [Specify]\n\n`;

      content += `### Merchandise Sales\n`;
      content += `- Table space required: [Yes/No]\n`;
      content += `- Venue commission: [Specify %]\n\n`;

      content += `### Photography & Recording\n`;
      content += `- Professional photography permitted: [Yes/No]\n`;
      content += `- Video recording permitted: [Yes/No]\n\n`;
    }

    content += `---\n\n`;
    content += `## Artist Signature\n\n`;
    content += `Artist Name: _________________________________\n`;
    content += `Signature: _________________________________ Date: _______\n\n`;

    content += `## Venue Signature\n\n`;
    content += `Venue Name: _________________________________\n`;
    content += `Signature: _________________________________ Date: _______\n`;

    return content;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rider Templates</CardTitle>
          <CardDescription>
            Manage your performance rider templates for different performance types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">My Templates</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-4">
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No rider templates yet</p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              {template.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadTemplate(template);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateTemplate(template);
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex gap-2 text-sm">
                          {template.sections.technical && (
                            <Badge variant="outline">Technical</Badge>
                          )}
                          {template.sections.hospitality && (
                            <Badge variant="outline">Hospitality</Badge>
                          )}
                          {template.sections.logistical && (
                            <Badge variant="outline">Logistical</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated {template.updatedAt.toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Create Tab */}
            <TabsContent value="create" className="space-y-4">
              {showCreateForm ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Rider Template</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Template Name</label>
                      <Input
                        placeholder="e.g., Standard Artist Rider"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder="Describe what this template is for..."
                        value={newTemplateDescription}
                        onChange={(e) => setNewTemplateDescription(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateTemplate}>Create Template</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewTemplateName('');
                          setNewTemplateDescription('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Create a new rider template customized for your needs
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Template
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Template Preview */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedTemplate.name}</CardTitle>
                <CardDescription>{selectedTemplate.description}</CardDescription>
              </div>
              <Button onClick={() => handleDownloadTemplate(selectedTemplate)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="bg-muted p-4 rounded-lg space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">Template Sections</h3>
                  <div className="flex gap-2">
                    {selectedTemplate.sections.technical && (
                      <Badge>Technical Requirements</Badge>
                    )}
                    {selectedTemplate.sections.hospitality && (
                      <Badge>Hospitality Requirements</Badge>
                    )}
                    {selectedTemplate.sections.logistical && (
                      <Badge>Logistical Requirements</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Quick Preview</h3>
                  <div className="text-muted-foreground space-y-2">
                    <p>
                      This template includes all necessary sections for a professional
                      performance rider. Download to customize with your specific requirements.
                    </p>
                    <p>
                      The rider will be legally binding when signed by both artist and venue,
                      and serves as an addendum to your performance contract.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Key Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Professional formatting and structure</li>
                    <li>Customizable sections and fields</li>
                    <li>Legal protection for both parties</li>
                    <li>Clear specification of requirements</li>
                    <li>Signature and acknowledgment blocks</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Rider Templates</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            A rider is a legally binding addendum to your performance contract that outlines
            all technical, hospitality, and logistical requirements for a successful show.
          </p>
          <p>
            Use these templates to communicate your needs clearly to venues and promoters,
            preventing misunderstandings and ensuring you have everything needed for a
            professional performance.
          </p>
          <p>
            You can create multiple templates for different performance types (solo, band,
            festival, etc.) and customize them based on each venue's capabilities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
