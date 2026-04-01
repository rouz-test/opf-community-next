

'use client';

const productKinds = [
  '헬스케어',
  '비오·제약',
  '콘텐츠',
  '제조·건설·부동산',
  '기업 IT',
  '홍보·마케팅',
  '법률',
  '보안',
  '농업',
  '교육',
  '게임·e스포츠',
  '반려생활',
  '리테일',
  '뷰티·패션',
  '여행·레저',
  '식품',
  '금융',
  '문화·예술',
  '모빌리티',
  '소셜 임팩트',
  '환경·에너지',
];

const productCategories = [
  '자유주행 솔루션',
  '소셜·커뮤니티',
  '웹툰·애니메이션',
  '메타버스·가상콘텐츠',
  '게임(모바일)',
  '게임(PC/콘솔)',
  '게임(모바일/PC/콘솔)',
  '쿠키·아동 체육·콘텐츠',
  '2차전지',
  '글로벌·비상관형 솔루션',
  '업무 효율화 솔루션',
  '생계분석 솔루션',
  '미디어 모니터링 솔루션',
  '전문가 서비스',
  '친환경 소비재',
  '스마트·웨어러블 디바이스',
  '스타트업 로컬 솔루션',
  '데이터 분석 서비스',
  '로보틱·하드웨어',
  '디지털 기부·서비스',
  '홈쇼·이상가솔루션',
  '전자·검사 솔루션',
  '건강관리 솔루션',
  '약물·치료제',
  '일상 의료정보 서비스',
  '비용·지출관리 솔루션',
  '공유 서비스',
  '송금·결제 서비스',
  '이동 서비스',
  '콘텐츠 관리 솔루션',
  '콘텐츠 제작 플랫폼',
  '콘텐츠 유통 플랫폼',
  'O2O 플랫폼',
  '인력매칭 플랫폼',
  '학습 솔루션',
  '커머스 플랫폼',
  '항공·스포츠/생활 플랫폼',
  '배송·운송 서비스',
];

export default function MyPageSettingsProductPage() {
  return (
    <div className="mx-auto w-full max-w-[960px]">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">프로덕트</h1>
      </header>

      <section className="mt-6 rounded-[28px] bg-white px-7 py-8 shadow-sm ring-1 ring-gray-200 sm:px-8 sm:py-9">
        <div className="space-y-8">
          <section>
            <label className="mb-2 block text-sm font-semibold text-gray-900">프로덕트 명</label>
            <input
              type="text"
              placeholder="프로덕트 명을 입력해 주세요."
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-300"
            />
            <p className="mt-2 text-right text-xs text-gray-400">0/100</p>
          </section>

          <section>
            <label className="mb-2 block text-sm font-semibold text-gray-900">프로덕트 한 줄 소개</label>
            <input
              type="text"
              placeholder="프로덕트 한 줄 소개를 입력해 주세요."
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-300"
            />
            <p className="mt-2 text-right text-xs text-gray-400">0/200</p>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">프로덕트 산업</h2>
            <div className="flex flex-wrap gap-2">
              {productKinds.map((kind, index) => {
                const isActive = kind === '비오·제약';

                return (
                  <button
                    key={`${kind}-${index}`}
                    type="button"
                    className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {kind}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">프로덕트 카테고리</h2>
            <div className="flex flex-wrap gap-2">
              {productCategories.map((category, index) => {
                const isActive = category === '글로벌·비상관형 솔루션';

                return (
                  <button
                    key={`${category}-${index}`}
                    type="button"
                    className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              프로덕트 링크 <span className="text-gray-400">(선택)</span>
            </label>
            <input
              type="text"
              placeholder="프로덕트 링크를 입력해 주세요."
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-300"
            />
            <p className="mt-2 text-right text-xs text-gray-400">0/200</p>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              className="min-w-[92px] rounded-xl border border-orange-300 bg-orange-50 px-5 py-2.5 text-sm font-semibold text-orange-500 transition-colors hover:bg-orange-100"
            >
              저장
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}