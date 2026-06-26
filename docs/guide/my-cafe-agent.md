# 가이드 — [Context+Agent+DB] 내 카페를 아는 AI 에이전트

> my_cafe.md(컨텍스트) + 운영 DB를 결합해 "내 카페를 잘 아는" 맞춤형 AI 운영 파트너.

## 전제
- 튜토리얼 내 AI Context 만들기, 대시보드(.md)+세부데이터 구조 완료. 운영 데이터(매출·메뉴·리뷰) 권장.

## 미션
- **Part 1 Context 준비**: my_cafe.md (이름·컨셉·타겟·시그니처·가격대·차별점)
- **Part 2 DB 운영 데이터**: 일별 매출/메뉴별 판매/리뷰/재고 등
- **Part 3 Context+DB 결합 에이전트**: 둘 다 읽어 내 카페 맞춤 답변
- **Part 4 Before/After 비교 시연**: Context 없이 vs 있이 (최소 2쌍)

## 핵심 구조
```
[AI Context(my_cafe.md)] + [운영 DB] → [에이전트가 둘 다 읽음] → [내 카페 맞춤 답변]
```

## 제출물
- GitHub 링크(my_cafe.md + 코드), Before/After 비교 스크린샷(2쌍+), my_cafe.md 화면, (보너스) 실전 활용 사례

## 팁
- my_cafe.md에 제약사항(예산·좌석·인력·재료)을 넣으면 답변이 실용적. DB가 많을수록 풍부. Before/After가 명확할수록 좋음.
