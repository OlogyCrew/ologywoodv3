import { useState, useMemo } from "react";
import { trpc } from "../lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Search } from "lucide-react";

export default function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<number, boolean>>({});

  // Fetch categories
  const categoriesQuery = trpc.faq.getCategories.useQuery();
  const categories = categoriesQuery.data || [];

  // Fetch FAQs with filtering
  const faqsQuery = trpc.faq.getAll.useQuery({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });
  const faqs = faqsQuery.data || [];

  // Mark helpful mutation
  const markHelpfulMutation = trpc.faq.markHelpful.useMutation();

  const handleMarkHelpful = async (id: number, helpful: boolean) => {
    setHelpfulFeedback(prev => ({
      ...prev,
      [id]: helpful,
    }));
    await markHelpfulMutation.mutateAsync({ id, helpful });
  };

  const filteredFAQs = useMemo(() => {
    if (!searchQuery) return faqs;
    
    const query = searchQuery.toLowerCase();
    return faqs.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  }, [faqs, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-purple-100 text-lg">Find answers to common questions about Ologywood</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        {/* FAQ Items */}
        {filteredFAQs.length > 0 ? (
          <div className="space-y-4">
            {filteredFAQs.map(faq => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 bg-white hover:bg-gray-50 text-left flex justify-between items-center"
                >
                  <h3 className="font-semibold text-gray-900 text-lg">{faq.question}</h3>
                  <span className={`text-purple-600 transition-transform ${expandedId === faq.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {expandedId === faq.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 mb-4 leading-relaxed">{faq.answer}</p>

                    {/* Helpful Feedback */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Was this helpful?</span>
                      <div className="flex gap-2">
                        <Button
                          variant={helpfulFeedback[faq.id] === true ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleMarkHelpful(faq.id, true)}
                          className="flex items-center gap-1"
                        >
                          <ThumbsUp size={16} />
                          Yes ({faq.helpful})
                        </Button>
                        <Button
                          variant={helpfulFeedback[faq.id] === false ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleMarkHelpful(faq.id, false)}
                          className="flex items-center gap-1"
                        >
                          <ThumbsDown size={16} />
                          No ({faq.notHelpful})
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No FAQs found. Try a different search or category.</p>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 bg-purple-50 border border-purple-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Didn't find what you're looking for?</h3>
          <p className="text-gray-600 mb-4">Contact our support team for additional help</p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
