import React, { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CreateProduct = () => {
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    price: '',
    acceptedTokens: [],
    allowInstallments: false,
    minDownPaymentRate: '2000',
    maxInstallments: '12',
    installmentFrequency: '2592000',
    initialStock: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Food'];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Mock upload for now - replace with actual Pinata upload
    setUploadingImage(true);
    setTimeout(() => {
      setProductForm({...productForm, imageUrl: URL.createObjectURL(file)});
      setUploadingImage(false);
    }, 2000);
  };

  const handleListProduct = async () => {
    if (!productForm.name || !productForm.price || productForm.acceptedTokens.length === 0) {
      alert('Please fill in all required fields and select at least one accepted token');
      return;
    }

    setLoading(true);
    // Mock API call - replace with actual contract interaction
    setTimeout(() => {
      alert('Product listed successfully!');
      setProductForm({
        name: '',
        description: '',
        category: '',
        imageUrl: '',
        price: '',
        acceptedTokens: [],
        allowInstallments: false,
        minDownPaymentRate: '2000',
        maxInstallments: '12',
        installmentFrequency: '2592000',
        initialStock: ''
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Product</h1>
        <p className="text-muted-foreground">List your products with images, pricing, and installment options</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Product Name *</label>
              <input
                type="text"
                placeholder="Enter product name"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Price (₦) *</label>
              <input
                type="number"
                placeholder="Enter price"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Initial Stock</label>
              <input
                type="number"
                placeholder="Enter stock quantity"
                value={productForm.initialStock}
                onChange={(e) => setProductForm({...productForm, initialStock: e.target.value})}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Product Description</label>
            <textarea
              placeholder="Describe your product..."
              value={productForm.description}
              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Product Image</label>
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-foreground font-medium">
                      {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </label>
                {uploadingImage && (
                  <div className="mt-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {productForm.imageUrl && (
                <div className="relative">
                  <img
                    src={productForm.imageUrl}
                    alt="Product preview"
                    className="w-full h-48 object-cover rounded-xl border border-border"
                  />
                  <button
                    onClick={() => setProductForm({...productForm, imageUrl: ''})}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Installment Options */}
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={productForm.allowInstallments}
                onChange={(e) => setProductForm({...productForm, allowInstallments: e.target.checked})}
                className="w-4 h-4 text-primary border-border rounded"
              />
              <span className="text-foreground">Allow Installments</span>
            </label>

            {productForm.allowInstallments && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Min Down Payment (%)</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={productForm.minDownPaymentRate}
                    onChange={(e) => setProductForm({...productForm, minDownPaymentRate: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Max Installments</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={productForm.maxInstallments}
                    onChange={(e) => setProductForm({...productForm, maxInstallments: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Frequency (days)</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={productForm.installmentFrequency}
                    onChange={(e) => setProductForm({...productForm, installmentFrequency: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleListProduct}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? 'Listing Product...' : 'List Product'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProduct;
