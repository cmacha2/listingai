import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Edit, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import WYSIWYGEditor from "./wysiwyg-editor";
import SEOScore from "./seo-score";

interface AIPreviewProps {
  generatedContent: {
    title: string;
    description: string;
  } | null;
  productData: any;
  onPublish?: () => void;
}

export default function AIPreview({ generatedContent, productData, onPublish }: AIPreviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editableTitle, setEditableTitle] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Update editable content when generated content changes
  useEffect(() => {
    if (generatedContent) {
      setEditableTitle(generatedContent.title);
      setEditableDescription(generatedContent.description);
    }
  }, [generatedContent]);

  const createListingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/listings", {
        ...productData,
        generatedTitle: editableTitle,
        generatedDescription: editableDescription,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Success!",
        description: "Listing saved successfully",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await apiRequest("POST", `/api/listings/${listingId}/publish`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Published!",
        description: `Listing published to eBay with ID: ${data.ebayItemId}`,
      });
      if (onPublish) onPublish();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to publish listing",
        variant: "destructive",
      });
    },
  });

  const handlePublish = async () => {
    try {
      // First create the listing
      const listing = await createListingMutation.mutateAsync();
      // Then publish it
      publishMutation.mutate(listing.id);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (!generatedContent) {
    return (
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">AI Generated Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="h-8 w-8 text-gray-400" />
            </div>
            <p>Generate content to see the preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">AI Generated Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Generated Title</label>
          <div className="bg-gray-50 p-4 rounded-lg border">
            {isEditing ? (
              <Textarea
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                className="bg-white border-0 p-0 font-medium text-gray-900 resize-none"
                rows={2}
              />
            ) : (
              <p className="font-medium text-gray-900">{editableTitle}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {editableTitle.length}/80 characters
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Generated Description</label>
          {isEditing ? (
            <WYSIWYGEditor
              value={editableDescription}
              onChange={setEditableDescription}
              placeholder="Edit your product description..."
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border h-48 overflow-y-auto">
              <div className="prose prose-sm text-gray-900 max-w-none">
                <div dangerouslySetInnerHTML={{ __html: editableDescription.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handlePublish}
            className="flex-1 bg-accent text-white hover:bg-green-600"
            disabled={createListingMutation.isPending || publishMutation.isPending}
          >
            {createListingMutation.isPending || publishMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publishing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Publish to eBay
              </>
            )}
          </Button>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            className="px-4"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
