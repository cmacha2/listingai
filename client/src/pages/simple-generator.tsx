import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Eye, Copy, CheckCircle } from "lucide-react";

export default function SimpleGenerator() {
  const [password, setPassword] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    setImages(files);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!password) {
      setError("Please enter password");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("password", password);
      images.forEach(image => {
        formData.append("images", image);
      });

      const response = await fetch("/api/simple-generator", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate listing");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.htmlTemplate) {
      navigator.clipboard.writeText(result.htmlTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl font-bold">
              Smart Save Depot - Listing Generator
            </CardTitle>
            <p className="text-blue-100 mt-2">
              Upload product images and generate optimized eBay listings with AI
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-lg font-semibold">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images" className="text-lg font-semibold">
                    Product Images (up to 5)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    {images.length > 0 && (
                      <p className="mt-4 text-sm text-gray-600">
                        {images.length} image{images.length > 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Listing"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Listing generated successfully!
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-semibold">Title</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                      <p className="text-gray-800">{result.title}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold">Description</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                      <p className="text-gray-800">{result.description}</p>
                    </div>
                  </div>

                  {result.imageUrls && result.imageUrls.length > 0 && (
                    <div>
                      <Label className="text-lg font-semibold">Uploaded Images</Label>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {result.imageUrls.map((url: string, index: number) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {showPreview ? "Hide" : "Show"} Preview
                    </Button>
                    <Button
                      onClick={copyToClipboard}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy HTML
                        </>
                      )}
                    </Button>
                  </div>

                  {showPreview && (
                    <div className="border rounded-lg p-4 bg-white">
                      <Label className="text-lg font-semibold mb-4 block">
                        HTML Preview
                      </Label>
                      <div
                        className="border rounded overflow-auto max-h-[600px]"
                        dangerouslySetInnerHTML={{ __html: result.htmlTemplate }}
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setResult(null);
                      setImages([]);
                      setPassword("");
                      setShowPreview(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Generate Another Listing
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

