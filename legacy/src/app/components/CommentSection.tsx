import { useState } from "react";
import { MessageCircle, Heart, MoreVertical } from "lucide-react";

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: Reply[];
}

export interface Reply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onAddReply: (commentId: string, content: string) => void;
}

export function CommentSection({
  comments,
  onAddComment,
  onAddReply,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const handleSubmitReply = (commentId: string) => {
    if (replyContent.trim()) {
      onAddReply(commentId, replyContent);
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            댓글 작성
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg p-4 border border-gray-200">
            {/* Comment Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
                  {comment.author[0]}
                </div>
                <div>
                  <p className="text-sm text-gray-900">{comment.author}</p>
                  <p className="text-xs text-gray-500">{comment.timestamp}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Comment Content */}
            <p className="text-gray-700 mb-3">{comment.content}</p>

            {/* Comment Actions */}
            <div className="flex items-center gap-4 text-sm">
              <button className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors">
                <Heart className="w-4 h-4" />
                <span>{comment.likes}</span>
              </button>
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>답글 {comment.replies.length}</span>
              </button>
            </div>

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <div className="mt-4 ml-12 bg-gray-50 rounded-lg p-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent("");
                    }}
                    className="px-4 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim()}
                    className="px-4 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    답글 작성
                  </button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-4 ml-12 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white text-sm">
                          {reply.author[0]}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{reply.author}</p>
                          <p className="text-xs text-gray-500">{reply.timestamp}</p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 ml-10">{reply.content}</p>
                    <div className="flex items-center gap-4 text-sm mt-2 ml-10">
                      <button className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors">
                        <Heart className="w-3 h-3" />
                        <span>{reply.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
