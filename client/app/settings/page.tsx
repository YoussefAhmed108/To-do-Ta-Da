'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { categoryService } from '@/lib/categoryService';
import { Plus, Trash2, X } from 'lucide-react';

export default function SettingsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      const updatedCategories = await categoryService.addCategory(newCategory.trim());
      setCategories(updatedCategories);
      setNewCategory('');
      setShowAddCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. It may already exist.');
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (!confirm(`Are you sure you want to delete the category "${category}"?`)) return;
    
    try {
      const updatedCategories = await categoryService.deleteCategory(category);
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category.');
    }
  };

  if (loading || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Task Categories</h2>
            {!showAddCategory && (
              <button
                type="button"
                onClick={() => setShowAddCategory(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Add Category
              </button>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Create custom categories to organize your tasks. These categories will be available when creating or editing tasks.
          </p>

          {showAddCategory && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700 mb-2">
                New Category Name
              </label>
              <div className="flex gap-2">
                <input
                  id="newCategory"
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    } else if (e.key === 'Escape') {
                      setShowAddCategory(false);
                      setNewCategory('');
                    }
                  }}
                  placeholder="e.g., Projects, Hobbies, Family"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategory('');
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No categories yet. Add your first category to get started!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <span className="font-medium text-gray-900">{category}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title={`Delete ${category}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
