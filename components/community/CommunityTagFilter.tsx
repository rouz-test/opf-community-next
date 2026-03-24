

export type CommunityTagFilterProps = {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
};

export function CommunityTagFilter({
  allTags,
  selectedTags,
  onToggleTag,
  onClearTags,
}: CommunityTagFilterProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-xs font-semibold text-gray-900">태그 필터</h3>
      <div className="flex flex-wrap gap-1.5">
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggleTag(tag)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
              selectedTags.includes(tag)
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
      {selectedTags.length > 0 && (
        <button
          type="button"
          onClick={onClearTags}
          className="mt-3 text-xs font-medium text-orange-500 hover:text-orange-600"
        >
          필터 초기화
        </button>
      )}
    </section>
  );
}