import { useState, useMemo } from "react";
import { HeroBanner } from "@/app/components/HeroBanner";
import { StudyFilter, FilterOptions } from "@/app/components/StudyFilter";
import { StudyCard } from "@/app/components/StudyCard";
import { mockStudies } from "@/data/mockStudies";

export function StudyListPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    category: "전체",
    location: "전체",
    isOnline: "전체",
    period: "전체",
  });

  const filteredStudies = useMemo(() => {
    return mockStudies.filter((study) => {
      // Search filter
      if (
        filters.search &&
        !study.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (filters.category !== "전체" && study.category !== filters.category) {
        return false;
      }

      // Online/Offline filter
      if (filters.isOnline === "온라인" && !study.isOnline) {
        return false;
      }
      if (filters.isOnline === "오프라인" && study.isOnline) {
        return false;
      }

      // Location filter (only for offline studies)
      if (
        filters.location !== "전체" &&
        !study.isOnline &&
        !study.location.includes(filters.location)
      ) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Separate studies by status
  const recruitingStudies = filteredStudies.filter(
    (s) => s.status === "recruiting"
  );
  const ongoingStudies = filteredStudies.filter((s) => s.status === "ongoing");
  const completedStudies = filteredStudies.filter(
    (s) => s.status === "completed"
  );

  // Popular studies (sorted by likes)
  const popularStudies = [...recruitingStudies]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 4);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Filter Section */}
      <StudyFilter onFilterChange={setFilters} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Studies Section */}
        {popularStudies.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="mb-2">인기 스터디 모집글</h2>
                <p className="text-gray-600">
                  가장 많은 관심을 받고 있는 스터디입니다
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularStudies.map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
            </div>
          </section>
        )}

        {/* Recruiting Studies Section */}
        {recruitingStudies.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="mb-2">모집 중인 스터디</h2>
                <p className="text-gray-600">
                  지금 바로 신청할 수 있는 스터디입니다
                </p>
              </div>
              <button className="text-orange-500 hover:text-orange-600 transition-colors">
                전체보기 →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recruitingStudies.map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
            </div>
          </section>
        )}

        {/* Ongoing Studies Section */}
        {ongoingStudies.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="mb-2">진행 중인 스터디</h2>
                <p className="text-gray-600">현재 활발하게 진행되고 있는 스터디입니다</p>
              </div>
              <button className="text-orange-500 hover:text-orange-600 transition-colors">
                전체보기 →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ongoingStudies.map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Studies Section */}
        {completedStudies.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="mb-2">완료된 스터디</h2>
                <p className="text-gray-600">성공적으로 완료된 스터디 아카이브</p>
              </div>
              <button className="text-orange-500 hover:text-orange-600 transition-colors">
                전체보기 →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {completedStudies.map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {filteredStudies.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">
              검색 조건에 맞는 스터디가 없습니다.
            </p>
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  category: "전체",
                  location: "전체",
                  isOnline: "전체",
                  period: "전체",
                })
              }
              className="text-orange-500 hover:text-orange-600 transition-colors"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
