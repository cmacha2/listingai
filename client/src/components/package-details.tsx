import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface PackageDetailsProps {
  control: Control<any>;
  watchPublishToEbay: boolean;
}

export default function PackageDetails({ control, watchPublishToEbay }: PackageDetailsProps) {
  if (!watchPublishToEbay) return null;

  return (
    <div className="bg-purple-50 p-4 rounded-lg">
      <h4 className="text-md font-semibold text-gray-900 mb-4">Package Details</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="packageWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Weight</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g. 1.5" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormField
                  control={control}
                  name="packageWeightUnit"
                  render={({ field: unitField }) => (
                    <Select onValueChange={unitField.onChange} value={unitField.value || "POUND"}>
                      <FormControl>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="POUND">lbs</SelectItem>
                        <SelectItem value="KILOGRAM">kg</SelectItem>
                        <SelectItem value="OUNCE">oz</SelectItem>
                        <SelectItem value="GRAM">g</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="packageType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LETTER">Letter</SelectItem>
                  <SelectItem value="LARGE_ENVELOPE">Large Envelope</SelectItem>
                  <SelectItem value="PACKAGE_THICK_ENVELOPE">Package/Thick Envelope</SelectItem>
                  <SelectItem value="MAILING_BOX">Mailing Box</SelectItem>
                  <SelectItem value="PADDED_BAGS">Padded Bags</SelectItem>
                  <SelectItem value="TOUGH_BAGS">Tough Bags</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Package Dimensions */}
      <div className="mt-4">
        <FormLabel>Package Dimensions</FormLabel>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <FormField
            control={control}
            name="packageLength"
            render={({ field }) => (
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="Length" 
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
            )}
          />
          <FormField
            control={control}
            name="packageWidth"
            render={({ field }) => (
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="Width" 
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
            )}
          />
          <FormField
            control={control}
            name="packageHeight"
            render={({ field }) => (
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="Height" 
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
            )}
          />
        </div>
        <div className="mt-2">
          <FormField
            control={control}
            name="packageDimensionUnit"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || "INCH"}>
                <FormControl>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INCH">Inches</SelectItem>
                  <SelectItem value="FEET">Feet</SelectItem>
                  <SelectItem value="CENTIMETER">cm</SelectItem>
                  <SelectItem value="METER">Meters</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <FormField
        control={control}
        name="shippingIrregular"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
            <div className="space-y-0.5">
              <FormLabel>Irregular Shipping</FormLabel>
              <div className="text-sm text-gray-500">
                Item has unusual shape or size that affects shipping
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
} 