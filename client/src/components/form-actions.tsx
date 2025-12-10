import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wand2, Upload, CheckCircle, Sparkles, ExternalLink, Eye } from "lucide-react";

interface FormActionsProps {
  watchPublishToEbay: boolean;
  currentStep: number;
  isGenerating: boolean;
  generateMutation: any;
  isSEOContentGenerated: boolean;
  generatedSEOContent: any;
  publishToEbayMutation: any;
  handlePublishToEbay: () => void;
  imageFiles: any[];
  analyzeImagesMutation: any;
  isAIAutofilled: boolean;
  form: any;
}

export default function FormActions({
  watchPublishToEbay,
  currentStep,
  isGenerating,
  generateMutation,
  isSEOContentGenerated,
  generatedSEOContent,
  publishToEbayMutation,
  handlePublishToEbay,
  imageFiles,
  analyzeImagesMutation,
  isAIAutofilled,
  form
}: FormActionsProps) {
  const autoFillWithAI = () => {
    if (imageFiles.length > 0) {
      const files = imageFiles.map((img: any) => img.file);
      analyzeImagesMutation.mutate(files);
    }
  };

  const handleGenerateContent = () => {
    form.handleSubmit((data: any) => {
      generateMutation.mutate(data);
    })();
  };

  return (
    <div className="space-y-6">
      <Separator />
      
      {/* Three Main Action Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
        
        {/* Button 1: Autofill with AI */}
        <Button
          type="button"
          onClick={autoFillWithAI}
          disabled={analyzeImagesMutation.isPending || imageFiles.length === 0}
          variant={isAIAutofilled ? "default" : "outline"}
          className={`w-full h-12 ${isAIAutofilled ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100'}`}
        >
          {analyzeImagesMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Analyzing {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''}...
            </>
          ) : isAIAutofilled ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              AI Autofilled ✓
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Autofill with AI
            </>
          )}
        </Button>
        {!isAIAutofilled && (
          <p className="text-sm text-gray-600 text-center">
            Upload images first, then click to extract product details automatically
          </p>
        )}

        {/* Button 2: Generate Content */}
        <Button
          type="button"
          onClick={handleGenerateContent}
          disabled={generateMutation.isPending || !form.getValues().productName}
          variant={isSEOContentGenerated ? "default" : "outline"}
          className={`w-full h-12 ${isSEOContentGenerated ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
        >
          {generateMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Generating content...
            </>
          ) : isSEOContentGenerated ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Content Generated ✓
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Content
            </>
          )}
        </Button>
        {!isSEOContentGenerated && (
          <p className="text-sm text-gray-600 text-center">
            Create SEO-optimized title and description for your listing
          </p>
        )}

        {/* Button 3: Publish to eBay */}
        {watchPublishToEbay && (
          <Button
            type="button"
            onClick={handlePublishToEbay}
            disabled={publishToEbayMutation.isPending || !isSEOContentGenerated}
            variant="default"
            className={`w-full h-12 ${publishToEbayMutation.isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          >
            {publishToEbayMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Publishing to eBay...
              </>
            ) : publishToEbayMutation.isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Published Successfully ✓
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Publish to eBay
              </>
            )}
          </Button>
        )}
        
        {watchPublishToEbay && !isSEOContentGenerated && (
          <p className="text-sm text-gray-600 text-center">
            Generate content first, then publish your listing to eBay
          </p>
        )}
      </div>
    </div>
  );
} 