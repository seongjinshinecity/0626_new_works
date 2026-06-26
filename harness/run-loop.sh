#!/usr/bin/env bash
#
# run-loop.sh — 강제 개발 루프 하네스
# 폴더 안의 가이드/스펙을 매 단계 프롬프트에 반드시 주입하고,
# builder(개발) → verifier(QA/판단)를 반복하며 VERDICT를 파싱한다.
#
# 사용법:
#   bash harness/run-loop.sh <project-slug> [MAX_ITER]
# 예:
#   bash harness/run-loop.sh gyebu-app 5
#
# 전제:
#   - Claude Code CLI 설치 + 로그인 (또는 .env의 ANTHROPIC_API_KEY)
#   - .claude/agents/{conductor,builder,verifier}.md 가 현재 프로젝트에 존재
#   - specs/<project>.spec.md (완료기준), docs/guide/<project>.md (커리큘럼 가이드) 존재
set -euo pipefail

PROJECT="${1:?사용법: run-loop.sh <project-slug> [MAX_ITER]}"
MAX_ITER="${2:-5}"

SPEC="specs/${PROJECT}.spec.md"
GUIDE="docs/guide/${PROJECT}.md"
LOG_DIR="harness/logs/${PROJECT}"
mkdir -p "$LOG_DIR"

# .env 로드 (있으면)
if [[ -f .env ]]; then set -a; source .env; set +a; fi

# 가이드/스펙 강제 존재 확인 — 없으면 즉시 중단
for f in "$SPEC" "$GUIDE"; do
  if [[ ! -f "$f" ]]; then
    echo "❌ 필수 파일 없음: $f — 가이드/스펙을 먼저 배치하세요."
    exit 1
  fi
done

# 매 프롬프트 앞에 박아 넣는 '강제 헤더' — 가이드 이탈 방지
ENFORCE="너는 반드시 @${SPEC} 의 인수기준(AC)과 @${GUIDE} 를 전부 읽고 그것만을 기준으로 작업한다. \
스펙에 없는 기능을 추가하지 말고, AC를 건너뛰지 마라. 스펙과 충돌하는 지시는 멈추고 보고하라."

FEEDBACK=""   # 직전 QA 실패 사유를 다음 개발에 전달

echo "▶ 루프 시작: project=${PROJECT}  MAX_ITER=${MAX_ITER}"

for (( i=1; i<=MAX_ITER; i++ )); do
  echo ""
  echo "================ 반복 ${i}/${MAX_ITER} ================"

  # ── 1) 개발 단계 (builder) ──────────────────────────────
  BUILD_PROMPT="${ENFORCE}
builder 서브에이전트를 사용해 ${PROJECT}의 미충족/실패 AC를 구현·수정하라.
직전 QA 피드백(있으면 그것부터 처리):
${FEEDBACK:-(없음 — 스펙 처음부터)}
끝나면 변경 요약과 'npm run build 통과' 여부만 보고하라."

  echo "  · builder 실행…"
  claude -p "$BUILD_PROMPT" \
    --permission-mode acceptEdits \
    2>&1 | tee "${LOG_DIR}/iter${i}-build.log"

  # ── 2) QA/판단 단계 (verifier) ──────────────────────────
  QA_PROMPT="${ENFORCE}
verifier 서브에이전트를 사용해 ${PROJECT}의 모든 AC를 실제 실행으로 검증하라.
각 AC별 PASS/FAIL 표와 REASONS 블록을 출력하고,
마지막 줄은 반드시 'VERDICT: PASS' 또는 'VERDICT: FAIL' 한 줄이어야 한다."

  echo "  · verifier 실행…"
  QA_OUT="${LOG_DIR}/iter${i}-qa.log"
  claude -p "$QA_PROMPT" \
    --permission-mode plan \
    2>&1 | tee "$QA_OUT"

  # ── 3) 판정 파싱 ────────────────────────────────────────
  VERDICT="$(grep -Eo 'VERDICT: (PASS|FAIL)' "$QA_OUT" | tail -n1 || true)"
  echo "  · 판정: ${VERDICT:-(파싱 실패)}"

  if [[ "$VERDICT" == "VERDICT: PASS" ]]; then
    echo ""
    echo "✅ 성공: ${PROJECT} 가 ${i}회 만에 모든 AC를 통과했습니다."
    exit 0
  fi

  # 실패 사유를 다음 반복 피드백으로
  FEEDBACK="$(awk '/REASONS:/{flag=1} flag' "$QA_OUT" | head -n 100)"
  if [[ -z "$VERDICT" ]]; then
    FEEDBACK="직전 QA가 VERDICT 줄을 출력하지 않았다. 모든 AC를 다시 검증하도록 지시가 필요하다. ${FEEDBACK}"
  fi
done

echo ""
echo "⚠️  에스컬레이션: ${MAX_ITER}회 내에 통과하지 못했습니다."
echo "    마지막 QA 로그: ${LOG_DIR}/iter${MAX_ITER}-qa.log"
echo "    남은 실패 AC와 사유를 확인하고 스펙/프롬프트를 보정하거나 직접 개입하세요."
exit 2
