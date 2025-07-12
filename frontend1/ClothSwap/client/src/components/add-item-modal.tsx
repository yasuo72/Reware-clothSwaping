import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { insertItemSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CloudUpload,
  X,
  Plus,
  Coins,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

const formSchema = insertItemSchema.extend({
  tags: z.string().optional(),
});

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddItemModal({ open, onOpenChange }: AddItemModalProps) {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      size: "",
      condition: "",
      brand: "",
      pointValue: 50,
      tags: "",
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'tags' && value) {
          // Convert comma-separated tags to array
          const tagsArray = value.split(',').map(tag => tag.trim()).filter(Boolean);
          formData.append('tags', tagsArray.join(','));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add images
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      await apiRequest("POST", "/api/items", formData);
    },
    onSuccess: () => {
      toast({
        title: "Item Listed Successfully!",
        description: "Your item has been submitted for review and will be available for swapping once approved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      onOpenChange(false);
      form.reset();
      setSelectedFiles([]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Failed to List Item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Some files were skipped. Only JPEG, PNG, and WebP files under 5MB are allowed.",
        variant: "destructive",
      });
    }

    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > 5) {
      toast({
        title: "Too Many Files",
        description: "You can only upload up to 5 images per item.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image of your item.",
        variant: "destructive",
      });
      return;
    }
    createItemMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">List New Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload */}
            <div>
              <FormLabel className="text-sm font-medium text-slate-900 mb-3 block">
                Photos
              </FormLabel>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragActive 
                    ? 'border-brand-green bg-green-50' 
                    : 'border-gray-300 hover:border-brand-green hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="space-y-2">
                  <CloudUpload className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-slate-600">
                    Drag and drop photos here, or{" "}
                    <span className="text-brand-green font-medium">browse</span>
                  </p>
                  <p className="text-sm text-slate-500">
                    Upload up to 5 photos (JPG, PNG, WebP, max 5MB each)
                  </p>
                </div>
              </div>

              {/* Image Previews */}
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {selectedFiles.length < 5 && (
                    <div
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-brand-green transition-colors"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Vintage Denim Jacket" 
                        {...field} 
                        className="focus:ring-brand-green focus:border-brand-green"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Levi's" 
                        {...field} 
                        className="focus:ring-brand-green focus:border-brand-green"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Describe the item's condition, style, and any special features..."
                      {...field}
                      className="focus:ring-brand-green focus:border-brand-green"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category & Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-brand-green focus:border-brand-green">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tops">Tops</SelectItem>
                        <SelectItem value="bottoms">Bottoms</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="dresses">Dresses</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-brand-green focus:border-brand-green">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="xs">XS</SelectItem>
                        <SelectItem value="s">S</SelectItem>
                        <SelectItem value="m">M</SelectItem>
                        <SelectItem value="l">L</SelectItem>
                        <SelectItem value="xl">XL</SelectItem>
                        <SelectItem value="xxl">XXL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-brand-green focus:border-brand-green">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="very-good">Very Good</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="vintage, casual, summer (separate with commas)"
                      {...field}
                      className="focus:ring-brand-green focus:border-brand-green"
                    />
                  </FormControl>
                  <p className="text-sm text-slate-500 mt-1">
                    Add tags to help others find your item
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Point Value */}
            <FormField
              control={form.control}
              name="pointValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Point Value</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="number"
                        min={25}
                        max={500}
                        step={5}
                        placeholder="e.g., 120"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="focus:ring-brand-green focus:border-brand-green pr-20"
                      />
                    </FormControl>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 flex items-center">
                      <Coins className="w-4 h-4 text-brand-amber mr-1" />
                      <span className="text-sm">points</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Suggested: 25-500 points based on item value and condition
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={createItemMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand-green hover:bg-green-700"
                disabled={createItemMutation.isPending}
              >
                {createItemMutation.isPending ? (
                  "Listing..."
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    List Item
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
