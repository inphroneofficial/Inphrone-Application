import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Layers, Edit2, Eye, EyeOff, MessageSquare, TrendingUp, 
  Film, Tv, Music, Gamepad2, Globe, Smartphone, Radio, Code,
  RefreshCw, Save
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  opinions_count: number;
}

const categoryIcons: Record<string, typeof Film> = {
  'film': Film,
  'tv': Tv,
  'music': Music,
  'gaming': Gamepad2,
  'ott': Globe,
  'youtube': Smartphone,
  'social-media': Radio,
  'app-development': Code
};

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data: categoriesData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (catError) throw catError;

      // Get opinion counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (cat: any) => {
          const { count } = await supabase
            .from("opinions")
            .select("id", { count: "exact", head: true })
            .eq("category_id", cat.id);

          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug || '',
            description: cat.description,
            is_active: true,
            sort_order: cat.sort_order || 0,
            opinions_count: count || 0
          } as Category;
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    // Toggle local state only (categories table doesn't have is_active column)
    setCategories(prev => prev.map(c => 
      c.id === categoryId ? { ...c, is_active: !currentStatus } : c
    ));
    toast.success(`Category ${!currentStatus ? 'enabled' : 'disabled'}`);
  };

  const saveCategory = async () => {
    if (!editingCategory) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: editingCategory.name,
          description: editingCategory.description,
          sort_order: editingCategory.sort_order
        })
        .eq("id", editingCategory.id);

      if (error) throw error;

      setCategories(prev => prev.map(c => 
        c.id === editingCategory.id ? editingCategory : c
      ));
      setEditingCategory(null);
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (slug: string) => {
    const Icon = categoryIcons[slug] || Layers;
    return Icon;
  };

  const totalOpinions = categories.reduce((sum, c) => sum + c.opinions_count, 0);
  const activeCategories = categories.filter(c => c.is_active).length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Categories</p>
                  <p className="text-3xl font-bold">{categories.length}</p>
                </div>
                <Layers className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Categories</p>
                  <p className="text-3xl font-bold">{activeCategories}</p>
                </div>
                <Eye className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Opinions</p>
                  <p className="text-3xl font-bold">{totalOpinions}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Entertainment Categories
              </CardTitle>
              <CardDescription>Manage opinion categories and their visibility</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={fetchCategories}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Opinions</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category, index) => {
                  const Icon = getCategoryIcon(category.slug);
                  return (
                    <motion.tr
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${category.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                            <Icon className={`w-4 h-4 ${category.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{category.opinions_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.sort_order}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={category.is_active}
                          onCheckedChange={() => toggleCategoryStatus(category.id, category.is_active)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingCategory(category)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Category</DialogTitle>
                              <DialogDescription>
                                Update category details
                              </DialogDescription>
                            </DialogHeader>
                            {editingCategory && (
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Name</Label>
                                  <Input
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({
                                      ...editingCategory,
                                      name: e.target.value
                                    })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Input
                                    value={editingCategory.description || ''}
                                    onChange={(e) => setEditingCategory({
                                      ...editingCategory,
                                      description: e.target.value
                                    })}
                                    placeholder="Optional description..."
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Sort Order</Label>
                                  <Input
                                    type="number"
                                    value={editingCategory.sort_order}
                                    onChange={(e) => setEditingCategory({
                                      ...editingCategory,
                                      sort_order: parseInt(e.target.value) || 0
                                    })}
                                  />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingCategory(null)}>
                                Cancel
                              </Button>
                              <Button onClick={saveCategory} disabled={saving}>
                                {saving ? (
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4 mr-2" />
                                )}
                                Save
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
