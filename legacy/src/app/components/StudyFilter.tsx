import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export interface FilterOptions {
  search: string;
  category: string;
  location: string;
  isOnline: string;
  period: string;
}

interface StudyFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const categories = ["전체", "비즈니스모델", "마케팅", "개발", "디자인", "투자유치"];
const locations = ["전체", "서울", "경기", "부산", "대구", "광주", "대전"];
const periods = ["전체", "1개월 이내", "1-3개월", "3-6개월", "6개월 이상"];

export function StudyFilter({ onFilterChange }: StudyFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    category: "전체",
    location: "전체",
    isOnline: "전체",
    period: "전체",
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="관심있는 스터디를 검색해보세요"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
              showFilters ? "bg-orange-50 border-orange-500 text-orange-600" : ""
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>필터</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="space-y-4 pb-2">
            {/* Category */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleFilterChange("category", category)}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      filters.category === category
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-500"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Online/Offline */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">진행 방식</label>
              <div className="flex flex-wrap gap-2">
                {["전체", "온라인", "오프라인"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange("isOnline", option)}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      filters.isOnline === option
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-500"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            {filters.isOnline !== "온라인" && (
              <div>
                <label className="block text-sm mb-2 text-gray-700">지역</label>
                <div className="flex flex-wrap gap-2">
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleFilterChange("location", location)}
                      className={`px-4 py-2 rounded-full border transition-colors ${
                        filters.location === location
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-orange-500"
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Period */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">기간</label>
              <div className="flex flex-wrap gap-2">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => handleFilterChange("period", period)}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      filters.period === period
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-500"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
