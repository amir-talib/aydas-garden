"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Comment, SeedColor } from "@/types/garden";
import { SEED_PALETTE } from "@/types/garden";

interface CommentSectionProps {
  memoryId: string;
  color: SeedColor;
  fetchComments: (memoryId: string) => Promise<Comment[]>;
  addComment: (memoryId: string, text: string) => Promise<Comment>;
  deleteComment: (memoryId: string, commentId: string) => Promise<void>;
}

export default function CommentSection({
  memoryId,
  color,
  fetchComments,
  addComment,
  deleteComment,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const palette = SEED_PALETTE[color];

  // Fetch comments when expanded
  useEffect(() => {
    if (isExpanded && comments.length === 0) {
      loadComments();
    }
  }, [isExpanded]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const fetched = await fetchComments(memoryId);
      setComments(fetched);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = await addComment(memoryId, newComment);
      setComments(prev => [comment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (deletingId) return;
    
    setDeletingId(commentId);
    try {
      await deleteComment(memoryId, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="border-t border-stone-100 mt-4 pt-4">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-600 transition-colors w-full group"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="font-medium">
          {comments.length > 0 ? `${comments.length} thought${comments.length === 1 ? "" : "s"}` : "Add a thought..."}
        </span>
        <div className="flex-1" />
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        ) : (
          <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
          {/* Add Comment Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="flex-1 px-4 py-2.5 bg-stone-50 rounded-xl text-sm border-none focus:ring-2 transition-shadow"
              style={{ focusRing: palette.hex } as React.CSSProperties}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2.5 rounded-xl text-white font-medium text-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              style={{ backgroundColor: palette.hex }}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <div 
                className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: `${palette.hex}40`, borderTopColor: palette.hex }}
              />
            </div>
          )}

          {/* Comments List */}
          {!isLoading && comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`group bg-stone-50 rounded-xl p-3 transition-all ${
                    deletingId === comment.id ? "opacity-50 scale-98" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div 
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: palette.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-700 leading-relaxed break-words">
                        {comment.text}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      title="Delete thought"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && comments.length === 0 && (
            <p className="text-center text-xs text-stone-400 py-2">
              Be the first to add a thought ✨
            </p>
          )}
        </div>
      )}
    </div>
  );
}
