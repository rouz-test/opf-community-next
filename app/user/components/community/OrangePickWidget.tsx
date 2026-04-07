import { Sparkles } from 'lucide-react';

type OrangePickArticle = {
  id: string | number;
  thumbnail: string;
  title: string;
  excerpt: string;
  author: string;
};

type OrangePickWidgetProps = {
  articles: OrangePickArticle[];
};

export function OrangePickWidget({ articles }: OrangePickWidgetProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-orange-400 to-orange-600">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">오렌지픽</h3>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="group cursor-pointer">
            <div className="mb-2 aspect-video overflow-hidden rounded-lg bg-gray-100">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h4 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-orange-500">
              {article.title}
            </h4>
            <p className="mb-2 line-clamp-2 text-xs text-gray-500">{article.excerpt}</p>
            <div className="text-xs text-gray-400">{article.author}</div>
          </div>
        ))}
      </div>
    </section>
  );
}