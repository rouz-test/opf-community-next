import { useState } from "react";
import { X } from "lucide-react";

interface CustomQuestion {
  id: string;
  question: string;
}

interface StudyApplicationFormProps {
  studyTitle: string;
  customQuestions?: CustomQuestion[];
  onClose: () => void;
  onSubmit: (formData: ApplicationFormData) => void;
}

export interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  organization: string;
  position: string;
  customAnswers: { [key: string]: string };
}

export function StudyApplicationForm({
  studyTitle,
  customQuestions = [],
  onClose,
  onSubmit,
}: StudyApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    email: "",
    phone: "",
    organization: "",
    position: "",
    customAnswers: {},
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCustomAnswerChange = (questionId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customAnswers: {
        ...prev.customAnswers,
        [questionId]: value,
      },
    }));
    // Clear error when user starts typing
    if (errors[`custom_${questionId}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`custom_${questionId}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate required fields
    if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요.";
    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "전화번호를 입력해주세요.";
    }
    if (!formData.organization.trim()) {
      newErrors.organization = "소속을 입력해주세요.";
    }
    if (!formData.position.trim()) {
      newErrors.position = "직책을 입력해주세요.";
    }

    // Validate custom questions
    customQuestions.forEach((q) => {
      if (!formData.customAnswers[q.id]?.trim()) {
        newErrors[`custom_${q.id}`] = "답변을 입력해주세요.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="mb-1">스터디 신청</h2>
            <p className="text-sm text-gray-600">{studyTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Fixed Fields */}
          <div className="space-y-4">
            <h3 className="pb-2 border-b border-gray-200">기본 정보</h3>

            {/* Name */}
            <div>
              <label className="block mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="홍길동"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-2">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="010-1234-5678"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Organization */}
            <div>
              <label className="block mb-2">
                소속 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => handleChange("organization", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.organization ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="회사명 또는 학교명"
              />
              {errors.organization && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.organization}
                </p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block mb-2">
                직책 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleChange("position", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.position ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="예: 대표, 개발자, 학생 등"
              />
              {errors.position && (
                <p className="text-red-500 text-sm mt-1">{errors.position}</p>
              )}
            </div>
          </div>

          {/* Custom Questions */}
          {customQuestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="pb-2 border-b border-gray-200">추가 질문</h3>

              {customQuestions.map((question, index) => (
                <div key={question.id}>
                  <label className="block mb-2">
                    {index + 1}. {question.question}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.customAnswers[question.id] || ""}
                    onChange={(e) =>
                      handleCustomAnswerChange(question.id, e.target.value)
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
                      errors[`custom_${question.id}`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    rows={4}
                    placeholder="답변을 입력해주세요"
                  />
                  {errors[`custom_${question.id}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`custom_${question.id}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              신청하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
