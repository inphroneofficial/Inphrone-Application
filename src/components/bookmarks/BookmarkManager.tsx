import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Trash2, ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface BookmarkedOpinion {
  id: string;
  title: string;
  description: string;
  category_name: string;
  category_color: string;
  bookmarked_at: string;
}

interface BookmarkManagerProps {
  userId: string;
}

export const BookmarkManager = ({ userId }: BookmarkManagerProps) => {
  const [bookmarks, setBookmarks] = useState<BookmarkedOpinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBookmarks();
  }, [userId]);

  const fetchBookmarks = async () => {
    try {
      const stored = localStorage.getItem(`bookmarks_${userId}`);
      if (!stored) {
        setBookmarks([]);
        setLoading(false);
        return;
      }

      const bookmarkIds = JSON.parse(stored);
      if (bookmarkIds.length === 0) {
        setBookmarks([]);
        setLoading(false);
        return;
      }

      const { data: opinions } = await supabase
        .from("opinions")
        .select(`
          id, title, description,
          categories:category_id (name, color)
        `)
        .in("id", bookmarkIds);

      if (opinions) {
        const bookmarkedOpinions: BookmarkedOpinion[] = opinions.map(op => ({
          id: op.id,
          title: op.title,
          description: op.description,
          category_name: (op.categories as any)?.name || "Unknown",
          category_color: (op.categories as any)?.color || "#888",
          bookmarked_at: new Date().toISOString()
        }));
        setBookmarks(bookmarkedOpinions);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = (opinionId: string) => {
    const stored = localStorage.getItem(`bookmarks_${userId}`);
    if (stored) {
      const bookmarkIds = JSON.parse(stored).filter((id: string) => id !== opinionId);
      localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(bookmarkIds));
      setBookmarks(prev => prev.filter(b => b.id !== opinionId));
      toast.success("Removed from bookmarks");
    }
  };

  const filteredBookmarks = bookmarks.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-semibold">Your Bookmarks</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Your Bookmarks</h3>
          <Badge variant="secondary">{bookmarks.length}</Badge>
        </div>
      </div>

      {bookmarks.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-8">
          <Bookmark className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">
            {bookmarks.length === 0 
              ? "No bookmarks yet. Save opinions you want to revisit!"
              : "No bookmarks match your search"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredBookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <Badge 
                    variant="outline" 
                    className="text-xs mb-1"
                    style={{ borderColor: bookmark.category_color, color: bookmark.category_color }}
                  >
                    {bookmark.category_name}
                  </Badge>
                  <h4 className="font-medium text-sm line-clamp-1">{bookmark.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {bookmark.description}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeBookmark(bookmark.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
};

// Hook for easy bookmark management
export const useBookmarks = (userId: string | null) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`bookmarks_${userId}`);
      if (stored) {
        setBookmarkedIds(new Set(JSON.parse(stored)));
      }
    }
  }, [userId]);

  const toggleBookmark = useCallback((opinionId: string) => {
    if (!userId) return;

    const newBookmarks = new Set(bookmarkedIds);
    if (newBookmarks.has(opinionId)) {
      newBookmarks.delete(opinionId);
      toast.success("Removed from bookmarks");
    } else {
      newBookmarks.add(opinionId);
      toast.success("Added to bookmarks");
    }
    setBookmarkedIds(newBookmarks);
    localStorage.setItem(`bookmarks_${userId}`, JSON.stringify([...newBookmarks]));
  }, [userId, bookmarkedIds]);

  const isBookmarked = useCallback((opinionId: string) => {
    return bookmarkedIds.has(opinionId);
  }, [bookmarkedIds]);

  return { bookmarkedIds, toggleBookmark, isBookmarked };
};
