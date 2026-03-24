import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  Calendar,
  MapPin,
  Users,
  Heart,
  Share2,
  Clock,
  DollarSign,
  ChevronLeft,
} from "lucide-react";
import { mockStudies } from "@/data/mockStudies";
import { CommentSection, Comment } from "@/app/components/CommentSection";
import {
  StudyApplicationForm,
  ApplicationFormData,
} from "@/app/components/StudyApplicationForm";

const mockComments: Comment[] = [
  {
    id: "1",
    author: "김창업",
    avatar: "",
    content: "정말 유익한 스터디였습니다! 실전 경험을 공유하는 부분이 특히 좋았어요.",
    timestamp: "2일 전",
    likes: 12,
    replies: [
      {
        id: "1-1",
        author: "이스타트",
        avatar: "",
        content: "저도 참여하고 싶은데 다음 기수도 열리나요?",
        timestamp: "1일 전",
        likes: 3,
      },
    ],
  },
  {
    id: "2",
    author: "박혁신",
    avatar: "",
    content: "궁금한 점이 있는데, 사전 준비가 필요한 부분이 있을까요?",
    timestamp: "3일 전",
    likes: 8,
    replies: [],
  },
];

// Mock custom questions for the application form
const mockCustomQuestions = [
  {
    id: "q1",
    question: "이 스터디에 지원하게 된 동기는 무엇인가요?",
  },
  {
    id: "q2",
    question: "현재 진행 중인 창업 프로젝트나 아이디어가 있다면 간단히 소개해주세요.",
  },
  {
    id: "q3",
    question: "스터디를 통해 얻고자 하는 것은 무엇인가요?",
  },
];

export function StudyDetailPage() {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>(mockComments);

  const study = mockStudies.find((s) => s.id === id);

  if (!study) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>스터디를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handleAddComment = (content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: "사용자",
      avatar: "",
      content,
      timestamp: "방금 전",
      likes: 0,
      replies: [],
    };
    setComments([newComment, ...comments]);
  };

  const handleAddReply = (commentId: string, content: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [
              ...comment.replies,
              {
                id: `${commentId}-${Date.now()}`,
                author: "사용자",
                avatar: "",
                content,
                timestamp: "방금 전",
                likes: 0,
              },
            ],
          };
        }
        return comment;
      })
    );
  };

  const handleApplicationSubmit = (formData: ApplicationFormData) => {
    console.log("Application submitted:", formData);
    // Here you would typically send the data to your backend
    alert("스터디 신청이 완료되었습니다!");
    setShowApplyModal(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>목록으로 돌아가기</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="relative aspect-[16/9]">
                <img
                  src={study.thumbnail}
                  alt={study.title}
                  className="w-full h-full object-cover"
                />
                {study.status === "recruiting" && (
                  <span className="absolute top-4 left-4 px-4 py-2 bg-orange-500 text-white rounded-full">
                    모집중
                  </span>
                )}
              </div>

              <div className="p-6">
                {/* Category */}
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm mb-3">
                  {study.category}
                </span>

                {/* Title */}
                <h1 className="mb-4">{study.title}</h1>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                      isLiked
                        ? "bg-red-50 border-red-500 text-red-500"
                        : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isLiked ? "fill-red-500" : ""}`}
                    />
                    <span>{study.likes + (isLiked ? 1 : 0)}</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>공유</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Study Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="mb-4">스터디 소개</h3>
              <div className="prose max-w-none text-gray-700">
                <p className="mb-4">
                  이 스터디는 실전 창업 경험을 공유하고 함께 성장하는 것을 목표로 합니다.
                </p>
                <p className="mb-4">
                  <strong>이런 분들께 추천합니다:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>창업을 준비하고 계신 분</li>
                  <li>실전 경험을 쌓고 싶으신 분</li>
                  <li>같은 목표를 가진 동료를 찾고 계신 분</li>
                  <li>체계적인 학습을 원하시는 분</li>
                </ul>
                <p className="mb-4">
                  <strong>진행 방식:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>주 1회 정기 모임 (2시간)</li>
                  <li>과제 및 피드백</li>
                  <li>멘토링 세션</li>
                  <li>네트워킹 이벤트</li>
                </ul>
                <p>
                  <strong>준비물:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>노트북</li>
                  <li>적극적인 참여 의지</li>
                </ul>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="mb-6">댓글 {comments.length}</h3>
              <CommentSection
                comments={comments}
                onAddComment={handleAddComment}
                onAddReply={handleAddReply}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
              <h3 className="mb-4">스터디 정보</h3>

              {/* Info List */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">기간</p>
                    <p className="text-gray-900">
                      {study.startDate} ~ {study.endDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">시간</p>
                    <p className="text-gray-900">매주 토요일 14:00 - 16:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">장소</p>
                    <p className="text-gray-900">
                      {study.isOnline ? "온라인 (Zoom)" : study.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">모집 인원</p>
                    <p className="text-gray-900">
                      {study.participants}/{study.maxParticipants}명
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (study.participants / study.maxParticipants) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">참가비</p>
                    <p className="text-orange-500">
                      {study.price === 0
                        ? "무료"
                        : `₩${study.price.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              {study.status === "recruiting" && (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  신청하기
                </button>
              )}
              {study.status === "ongoing" && (
                <button
                  disabled
                  className="w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                >
                  진행중
                </button>
              )}
              {study.status === "completed" && (
                <button
                  disabled
                  className="w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                >
                  완료됨
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <StudyApplicationForm
          studyTitle={study.title}
          customQuestions={mockCustomQuestions}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
}