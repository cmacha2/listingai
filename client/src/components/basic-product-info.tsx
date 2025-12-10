import { useState } from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LanguageSelector from "./language-selector";

interface BasicProductInfoProps {
  control: Control<any>;
  form: any; // React Hook Form instance
  isAIAutofilled: boolean;
}

export default function BasicProductInfo({ control, form, isAIAutofilled }: BasicProductInfoProps) {
  const [categoryInput, setCategoryInput] = useState("");

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
        📝 Step 1: Basic Product Information
        {isAIAutofilled && <Badge className="bg-green-100 text-green-800">AI Completed</Badge>}
      </h3>
      
      <FormField
        control={control}
        name="productName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Apple iPhone 13 Pro Max" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g. 999.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories (up to 5)</FormLabel>
              <FormControl>
                <div>
                  <div className="flex">
                    <Input
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && categoryInput.trim()) {
                          e.preventDefault();
                          if (field.value.length < 5 && !field.value.includes(categoryInput.trim())) {
                            form.setValue("categories", [...field.value, categoryInput.trim()]);
                            setCategoryInput("");
                          }
                        }
                      }}
                      placeholder="Type a category and press Enter"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="ml-2"
                      onClick={() => {
                        if (categoryInput.trim() && field.value.length < 5 && !field.value.includes(categoryInput.trim())) {
                          form.setValue("categories", [...field.value, categoryInput.trim()]);
                          setCategoryInput("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((category: string) => (
                      <Badge key={category} variant="secondary">
                        {category}
                        <button
                          type="button"
                          className="ml-2"
                          onClick={() => form.setValue("categories", field.value.filter((c: string) => c !== category))}
                        >
                          &times;
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="features"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Key Features</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="List the main features and benefits..." 
                className="h-24"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <FormControl>
                <LanguageSelector value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
} 