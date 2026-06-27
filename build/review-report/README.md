# 📊 리뷰/경쟁 리포트 자동화 (프로젝트 8)

원천 텍스트(고객 리뷰 / 경쟁사 메모) → **실제 엑셀·PPT 파일**로 자동 변환합니다.
"분석을 말로 설명"이 아니라 **차트·피벗·표·슬라이드 객체가 실제로 들어간 파일**을 만드는 게 핵심입니다.

자사 컨텍스트는 `../my-cafe-agent/my_cafe.md`(데일리브루, 좌석 24석·디저트 강점)를 기준으로 일관됩니다.

## 산출물

| 경로 | 입력 | 산출 | 내용 |
| --- | --- | --- | --- |
| **A. VoC 엑셀** | `cafe_reviews.csv` (20건) | `out/voc_analysis.xlsx` | 5시트 + 차트 3개 |
| **B. 경쟁 PPT** | `competitors.md` | `out/competitor_analysis.pptx` | 5슬라이드 + 비교표 |

### A. voc_analysis.xlsx (5시트)
1. **요약** — 평균 별점 3.45, 핵심 인사이트
2. **리뷰원본** — 자동필터·고정행, 부정(★≤2) 행 빨강 하이라이트
3. **별점분포** — 표 + **막대 차트 + 원형 차트**
4. **테마피벗** — 전체 vs 부정 교차 + **막대 차트**
5. **부정Top3** — 부정 테마 Top3 + 대표 리뷰 + 개선 액션

> 📌 데이터에서 **부정 리뷰 1위 = '대기시간'(3건)** 이 자연 도출됩니다(결론 하드코딩 X). my_cafe.md의 '주말 피크 대기'와 일치.

### B. competitor_analysis.pptx (5슬라이드)
표지 → 시장개요 → **경쟁사 비교표(실제 table)** → 차별화 전략 → 추천 액션
스토리: 대기시간 pain → 예약/회전 차별화 → **인플루언서 협업 추천(프로젝트 9 연계)**

## 실행
```bash
pip install openpyxl python-pptx     # 의존성
python3 make_voc_xlsx.py             # -> out/voc_analysis.xlsx
python3 make_competitor_pptx.py      # -> out/competitor_analysis.pptx
```

## 검증 (이 프로젝트의 변별 기준)
파일이 "써졌다"가 아니라 **열어서 객체가 존재**해야 통과:
```bash
# 엑셀: 시트 5개 + 차트 합계 3개
python3 -c "from openpyxl import load_workbook; wb=load_workbook('out/voc_analysis.xlsx'); print(wb.sheetnames, sum(len(ws._charts) for ws in wb))"
# PPT: 슬라이드 5개 + slide3 표 존재
python3 -c "from pptx import Presentation; p=Presentation('out/competitor_analysis.pptx'); print(len(p.slides._sldIdLst), [any(sh.has_table for sh in s.shapes) for s in p.slides])"
```
실제 검증 결과: 엑셀 차트 3개(막대·원형·테마), PPT 슬라이드 5장·slide3 표 1개 — 확인됨.

### 실행 스크린샷 (파일 열어본 렌더)
맥 Quick Look으로 실제 렌더한 미리보기: `docs/screenshots/`
- `voc_analysis.xlsx.png` — 엑셀 요약 시트(평균 별점 3.45, 부정 1위=대기시간) 실제 렌더
- `competitor_analysis.pptx.png` — PPT 표지 슬라이드 실제 렌더

> ⚠️ Quick Look은 **첫 시트/슬라이드만** 썸네일로 보여줍니다(차트가 든 '별점분포' 시트·비교표 슬라이드는 안 보임). 차트 3개·비교표 객체는 위 코드 검증(`_charts`/`has_table`)으로 확인했습니다.
> 📌 **사용자 확인 단계**: 두 파일을 **Excel/PowerPoint(또는 Numbers/Keynote)로 한 번 열어** 차트·비교표가 화면에 그려지는지 확인해 주세요. (이 환경엔 LibreOffice가 없어 전체 슬라이드 렌더는 못 만듭니다 — 빌드 성공≠전체 렌더와 같은 맥락.)

## 폴더 구조
```
build/review-report/
├─ cafe_reviews.csv          # 경로 A 원천 (리뷰 20건)
├─ competitors.md            # 경로 B 원천 (경쟁 분석 메모)
├─ make_voc_xlsx.py          # 엑셀 생성기
├─ make_competitor_pptx.py   # PPT 생성기
└─ out/
   ├─ voc_analysis.xlsx
   └─ competitor_analysis.pptx
```
