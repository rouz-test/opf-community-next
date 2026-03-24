import { BookOpen, Users, FileText, MessageSquare } from "lucide-react";

export function CampusPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200">
        <div className="p-6">
          <h2 className="font-semibold text-lg text-gray-900 mb-4">캠퍼스</h2>
          <nav className="space-y-1">
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-orange-50 text-orange-600">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">신청 내역</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">팀 빌딩</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">지원/팀 관리</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">활동 게시판</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">신청 내역</h1>
            <p className="text-sm text-gray-500">참여 중인 교육 프로그램을 확인하세요</p>
          </div>

          {/* Placeholder Content */}
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">신청한 교육 프로그램이 없습니다</p>
            <p className="text-sm text-gray-400">교육 프로그램에 참여하여 창업 역량을 키워보세요</p>
          </div>
        </div>
      </main>
    </div>
  );
}
