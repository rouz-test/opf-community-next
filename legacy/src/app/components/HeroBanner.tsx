import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  {
    id: 1,
    title: "새로운 스터디 멤버를 찾아보세요",
    description: "함께 성장할 동료들과 창업 여정을 시작하세요",
    image: "https://images.unsplash.com/photo-1758873268663-5a362616b5a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzY5NDkzMTU3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    buttonText: "스터디 둘러보기",
  },
  {
    id: 2,
    title: "실전 창업 스터디 모집 중",
    description: "경험 많은 멘토와 함께하는 실무 중심 학습",
    image: "https://images.unsplash.com/photo-1758691737182-d42aefd6dee8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGVkdWNhdGlvbiUyMGxlYXJuaW5nJTIwZ3JvdXB8ZW58MXx8fHwxNzY5NDkzMTU4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    buttonText: "자세히 보기",
  },
  {
    id: 3,
    title: "온라인으로 편리하게",
    description: "시간과 장소에 구애받지 않고 참여하세요",
    image: "https://images.unsplash.com/photo-1762784574847-16c5100cd1ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBjcmVhdGl2ZSUyMG1lZXRpbmd8ZW58MXx8fHwxNzY5NDkzMTU4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    buttonText: "온라인 스터디 보기",
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 text-center text-white">
              <h2 className="text-4xl md:text-5xl mb-4">
                {banner.title}
              </h2>
              <p className="text-lg md:text-xl mb-8 text-gray-200">
                {banner.description}
              </p>
              <button className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                {banner.buttonText}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-orange-500 w-8"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
