import { Heart, MessageSquare, TrendingUp } from 'lucide-react';

type PopularPost = {
  id: string | number;
  title: string;
  likes: number;
  commentCount?: number;
};

type PopularPostsWidgetProps = {
  popularPosts: PopularPost[];
};

export function PopularPostsWidget({ popularPosts }: PopularPostsWidgetProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-orange-500" />
        <h3 className="text-sm font-semibold text-gray-900">이번달 인기 게시글 TOP5</h3>
      </div>

      <div className="space-y-3">
        {popularPosts.map((post, index) => (
          <div key={post.id} className="flex gap-3">
            <span
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-sm font-bold ${
                index === 0
                  ? 'bg-orange-500 text-white'
                  : index === 1
                    ? 'bg-orange-100 text-orange-600'
                    : index === 2
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-400'
              }`}
            >
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors hover:text-orange-500">
                {post.title}
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post.commentCount ?? 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}