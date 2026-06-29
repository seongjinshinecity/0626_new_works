# 🎨 UI 페이지 모음 (HTML)

부트캠프 결과물 중 UI가 없던 것들을 **단일 HTML 페이지**로 시각화했습니다. 모두 **외부 의존성 없는 자기완결 HTML**(인라인 CSS·순수 CSS 차트, CDN/JS/폰트 0) — 더블클릭으로 바로 열립니다. 데일리브루 앰버/크림 브랜드 톤으로 통일.

> 3개 서브에이전트로 병렬 제작 후, headless Chrome 렌더로 데이터 정확성을 검증했습니다.

## 페이지

| 파일 | 내용 | 데이터 소스 |
| --- | --- | --- |
| `daily-brew.html` | **데일리브루 카페 소개/랜딩** — 슬로건·시그니처 메뉴·분위기·방문정보 | `build/my-cafe-agent/my_cafe.md` |
| `influencer-dashboard.html` | **인스타 인플루언서 발굴 대시보드** — 타겟·인게이지먼트율 공식·Top5·Top3+DM | `build/instagram-influencer/*.md` |
| `review-dashboard.html` | **리뷰(VoC) & 경쟁 분석 대시보드** — 별점분포·테마피벗·부정Top3·경쟁비교 | `build/review-report/cafe_reviews.csv`, `competitors.md` |

## 데이터 정직성 (가짜 없음)
- **카페 소개**: my_cafe.md의 실제 항목(슬로건 "매일 굽는 디저트, 데일리브루", 치즈케이크 3,000~6,500원 등)만 반영.
- **인플루언서**: `influencers.example.md`의 `@demo_*` **가상 데모 데이터** 그대로 + 상단에 **"⚠️ 가상 데모 — 실존 인물 아님"** 빨강 배너. 새 계정/숫자 생성 없음. 실데이터는 본인 인스타 로그인 후 교체.
- **리포트**: CSV 20행을 **실제 집계** — 평균 별점 3.45, 부정(★≤2) 6건, **부정 Top3 = 대기시간(3)·가격(2)·청결(1)**. 결론 하드코딩 아님.

## 열기 / 검증
```bash
open daily-brew.html            # 맥에서 브라우저로 바로 열기
open influencer-dashboard.html
open review-dashboard.html
```
렌더 스크린샷: `docs/screenshots/01_daily-brew.png`, `02_influencer.png`, `03_review.png`.

## 폴더 구조
```
build/ui/
├─ daily-brew.html
├─ influencer-dashboard.html
├─ review-dashboard.html
└─ docs/screenshots/   # 렌더 검증 캡처 3장
```
