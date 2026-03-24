import { Link } from "react-router";
import { Calendar, MapPin, Users, Heart } from "lucide-react";
import { useState } from "react";

export interface Study {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  participants: number;
  maxParticipants: number;
  price: number;
  status: "recruiting" | "ongoing" | "completed";
  likes: number;
}

interface StudyCardProps {
  study: Study;
}

export function StudyCard({ study }: StudyCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
  };

  const getStatusBadge = () => {
    switch (study.status) {
      case "recruiting":
        return (
          <span className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white rounded-full text-sm">
            모집중
          </span>
        );
      case "ongoing":
        return (
          <span className="absolute top-3 left-3 px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
            진행중
          </span>
        );
      case "completed":
        return (
          <span className="absolute top-3 left-3 px-3 py-1 bg-gray-500 text-white rounded-full text-sm">
            완료
          </span>
        );
    }
  };

  return (
    <Link to={`/study/${study.id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
        {/* Thumbnail */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          <img
            src={study.thumbnail}
            alt={study.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {getStatusBadge()}
          <button
            onClick={handleLikeClick}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <span className="inline-block px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs mb-2">
            {study.category}
          </span>

          {/* Title */}
          <h3 className="mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors">
            {study.title}
          </h3>

          {/* Info */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {study.startDate} ~ {study.endDate}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{study.isOnline ? "온라인" : study.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                {study.participants}/{study.maxParticipants}명
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-orange-500">
              {study.price === 0 ? "무료" : `₩${study.price.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
