import { useState } from "react";
import { Plus, Users, Clock, CheckCircle, FolderOpen } from "lucide-react";
import { StudyCard } from "@/app/components/StudyCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { mockStudies } from "@/data/mockStudies";

type SidebarSection = "created" | "applied" | "ongoing" | "completed";

export function MyStudyPage() {
  const [activeSection, setActiveSection] = useState<SidebarSection>("created");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data - 각 섹션별로 필터링된 스터디
  const createdStudies = mockStudies.filter((_, idx) => idx < 2);
  const appliedStudies = mockStudies.filter((_, idx) => idx >= 2 && idx < 4);
  const ongoingStudies = mockStudies.filter((_, idx) => idx >= 4 && idx < 6);
  const completedStudies = mockStudies.filter((_, idx) => idx >= 6);

  const getSectionData = () => {
    switch (activeSection) {
      case "created":
        return { title: "내가 개설한 스터디", studies: createdStudies, emptyMessage: "개설한 스터디가 없습니다." };
      case "applied":
        return { title: "신청한 스터디", studies: appliedStudies, emptyMessage: "신청한 스터디가 없습니다." };
      case "ongoing":
        return { title: "진행 중인 스터디", studies: ongoingStudies, emptyMessage: "진행 중인 스터디가 없습니다." };
      case "completed":
        return { title: "완료된 스터디", studies: completedStudies, emptyMessage: "완료된 스터디가 없습니다." };
    }
  };

  const sectionData = getSectionData();

  const handleCreateStudy = (e: React.FormEvent) => {
    e.preventDefault();
    // 스터디 생성 로직
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200">
        <div className="p-6">
          <h2 className="font-semibold text-lg text-gray-900 mb-4">내 스터디</h2>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection("created")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeSection === "created"
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span className="text-sm font-medium">내가 개설한 스터디</span>
            </button>
            <button
              onClick={() => setActiveSection("applied")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeSection === "applied"
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">신청한 스터디</span>
            </button>
            <button
              onClick={() => setActiveSection("ongoing")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeSection === "ongoing"
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">진행 중인 스터디</span>
            </button>
            <button
              onClick={() => setActiveSection("completed")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeSection === "completed"
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">완료된 스터디</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">{sectionData.title}</h1>
              <p className="text-sm text-gray-500">총 {sectionData.studies.length}개의 스터디</p>
            </div>
            
            {/* Create Study Button */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  스터디 개설하기
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>스터디 개설하기</DialogTitle>
                  <DialogDescription>
                    새로운 스터디를 개설하고 함께 학습할 멤버를 모집하세요.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateStudy} className="space-y-6 mt-4">
                  <div>
                    <Label htmlFor="title">스터디 제목 *</Label>
                    <Input id="title" placeholder="스터디 제목을 입력하세요" required className="mt-1.5" />
                  </div>

                  <div>
                    <Label htmlFor="category">카테고리 *</Label>
                    <Select required>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">마케팅</SelectItem>
                        <SelectItem value="design">디자인</SelectItem>
                        <SelectItem value="development">개발</SelectItem>
                        <SelectItem value="business">비즈니스</SelectItem>
                        <SelectItem value="etc">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">진행 방식 *</Label>
                      <Select required>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">비대면</SelectItem>
                          <SelectItem value="offline">대면</SelectItem>
                          <SelectItem value="hybrid">혼합</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="region">지역</Label>
                      <Select>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seoul">서울</SelectItem>
                          <SelectItem value="gyeonggi">경기</SelectItem>
                          <SelectItem value="incheon">인천</SelectItem>
                          <SelectItem value="busan">부산</SelectItem>
                          <SelectItem value="etc">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">시작일 *</Label>
                      <Input id="startDate" type="date" required className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="endDate">종료일 *</Label>
                      <Input id="endDate" type="date" required className="mt-1.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxMembers">모집 인원 *</Label>
                      <Input id="maxMembers" type="number" min="2" placeholder="예: 10" required className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="recruitDeadline">모집 마감일 *</Label>
                      <Input id="recruitDeadline" type="date" required className="mt-1.5" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">스터디 소개 *</Label>
                    <Textarea
                      id="description"
                      placeholder="스터디에 대해 자세히 설명해주세요"
                      required
                      className="mt-1.5 min-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="schedule">일정 및 커리큘럼</Label>
                    <Textarea
                      id="schedule"
                      placeholder="예: 매주 수요일 오후 7시, 1주차 - OOO, 2주차 - XXX"
                      className="mt-1.5 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">준비물 및 사전 요구사항</Label>
                    <Textarea
                      id="requirements"
                      placeholder="참여자가 준비해야 할 사항을 입력하세요"
                      className="mt-1.5 min-h-[80px]"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      취소
                    </Button>
                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                      개설하기
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Study List */}
          {sectionData.studies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectionData.studies.map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">{sectionData.emptyMessage}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}