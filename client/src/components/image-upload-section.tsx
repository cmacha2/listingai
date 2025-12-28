import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Upload, ImageIcon, X, Plus, Sparkles, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface ImageFile {
  file: File;
  preview: string;
  id: string;
  cloudinaryUrl?: string;
  isUploading?: boolean;
}

interface ImageUploadSectionProps {
  imageFiles: ImageFile[];
  setImageFiles: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  onAnalyzeImages: (files: File[]) => void;
  analyzeImagesMutation: any;
  isAIAutofilled: boolean;
}

export default function ImageUploadSection({
  imageFiles,
  setImageFiles,
  onAnalyzeImages,
  analyzeImagesMutation,
  isAIAutofilled,
}: ImageUploadSectionProps) {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);

  // Mutation for uploading images to Cloudinary
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'product');
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image to cloud storage",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Only image files are allowed`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be under 5MB`);
        return;
      }

      if (validFiles.length + imageFiles.length >= 12) {
        errors.push(`Maximum 12 images allowed per listing`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      toast({
        title: "Upload Error",
        description: errors[0],
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      const newImageFiles = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(7),
        isUploading: true,
      }));

      setImageFiles(prev => [...prev, ...newImageFiles]);

      // Upload each file to Cloudinary
      validFiles.forEach(async (file, index) => {
        const imageId = newImageFiles[index].id;
        try {
          const result = await uploadImageMutation.mutateAsync(file);
          
          // Update the image with Cloudinary URL
          setImageFiles(prev => prev.map(img => 
            img.id === imageId 
              ? { ...img, cloudinaryUrl: result.url, isUploading: false }
              : img
          ));
        } catch (error) {
          // Remove failed upload
          setImageFiles(prev => prev.filter(img => img.id !== imageId));
        }
      });

      toast({
        title: "Images Added",
        description: `${validFiles.length} image(s) uploading to cloud storage...`,
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleAnalyzeImages = () => {
    if (imageFiles.length > 0) {
      const files = imageFiles.map(img => img.file);
      onAnalyzeImages(files);
    }
  };

  // Check if all images are uploaded to Cloudinary
  const allImagesUploaded = imageFiles.length > 0 && imageFiles.every(img => img.cloudinaryUrl && !img.isUploading);
  const hasUploadingImages = imageFiles.some(img => img.isUploading);

  const removeImage = (id: string) => {
    setImageFiles(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const removeAllImages = () => {
    imageFiles.forEach(img => URL.revokeObjectURL(img.preview));
    setImageFiles([]);
  };

  return (
    <div>
      <FormLabel>Product Images ({imageFiles.length}/12)</FormLabel>
      
      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${
          isDragOver 
            ? 'border-primary bg-blue-50' 
            : imageFiles.length >= 12 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-primary'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          id="images-upload"
          disabled={imageFiles.length >= 12}
        />
        <label 
          htmlFor="images-upload" 
          className={`cursor-pointer ${imageFiles.length >= 12 ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {imageFiles.length >= 12 ? (
            <>
              <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">Maximum images reached</p>
              <p className="text-gray-400 text-sm">12/12 images uploaded</p>
            </>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">Upload Product Images</p>
              <p className="text-gray-500 text-sm">Click to upload or drag and drop multiple images</p>
              <p className="text-gray-400 text-xs mt-1">AI will analyze all images for better accuracy</p>
            </>
          )}
        </label>
      </div>

      {/* Image Previews Grid */}
      {imageFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {imageFiles.map((image) => (
              <div key={image.id} className="relative group">
                <img 
                  src={image.preview} 
                  alt="Product preview" 
                  className={`w-full h-20 object-cover rounded-lg border-2 transition ${
                    image.isUploading 
                      ? 'border-blue-300 opacity-50' 
                      : image.cloudinaryUrl 
                        ? 'border-green-300' 
                        : 'border-gray-200 group-hover:border-primary'
                  }`}
                />
                
                {/* Upload status indicator */}
                {image.isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                )}
                
                {/* Success indicator */}
                {image.cloudinaryUrl && !image.isUploading && (
                  <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            {/* Add more images button */}
            {imageFiles.length < 12 && (
              <div 
                className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary transition cursor-pointer"
                onClick={() => document.getElementById('images-upload')?.click()}
              >
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleAnalyzeImages}
              disabled={analyzeImagesMutation.isPending || imageFiles.length === 0 || !allImagesUploaded}
              variant={isAIAutofilled ? "default" : "outline"}
              size="sm"
              className={`flex-1 ${isAIAutofilled ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
            >
              {analyzeImagesMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                  Analyzing {imageFiles.length} image{imageFiles.length > 1 ? 's' : ''}...
                </>
              ) : isAIAutofilled ? (
                <>
                  <CheckCircle className="mr-2 h-3 w-3" />
                  AI Autofilled ✓
                </>
              ) : hasUploadingImages ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                  Uploading images to cloud...
                </>
              ) : !allImagesUploaded && imageFiles.length > 0 ? (
                <>
                  <Upload className="mr-2 h-3 w-3" />
                  Waiting for uploads...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-3 w-3" />
                  🧠 Step 1: AI Auto-Fill ({imageFiles.length} image{imageFiles.length > 1 ? 's' : ''})
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={removeAllImages}
              variant="outline"
              size="sm"
            >
              <X className="mr-2 h-3 w-3" />
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 