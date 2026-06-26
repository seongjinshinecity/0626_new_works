#!/usr/bin/env bash
#
# run-all.sh — 1~9번 프로젝트 전체 자동 실행기
# 순서대로 각 프로젝트를:
#   ① 작업폴더 생성 + 에이전트/가이드/스펙 배치
#   ② 스펙 없으면 가이드로 자동 생성
#   ③ develop→QA 루프(run-loop.sh)를 PASS까지 반복(최대 MAX회)
#   ④ 결과 기록 후 다음 프로젝트로
# 사람이 직접 로그인/확인이 필요한 프로젝트는 프롬프트만 띄우고 건너뜀.
#
# 사용법:
#   bash harness/run-all.sh            # 전체(기본 build/ 폴더, 반복 5회)
#   bash harness/run-all.sh ./build 5  # 작업폴더, 최대 반복 지정
#
set -uo pipefail

SETUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKDIR="${1:-./build}"
MAX_ITER="${2:-5}"

# 진행 순서 (1~9)
PROJECTS=(
  gyebu-app          # 1
  community-app      # 2
  shopping-mall      # 3
  cafe-dashboard     # 4
  gyebu-agent        # 5
  my-cafe-agent      # 6
  research-skill     # 7  (사람 개입)
  review-report      # 8
  instagram-influencer # 9 (사람 개입: 인스타 로그인)
)
# 사람이 직접 해야 하는(headless 불가) 프로젝트
NEEDS_HUMAN=" research-skill instagram-influencer "

mkdir -p "$WORKDIR"
[[ -f "$SETUP_DIR/.env" ]] && { set -a; source "$SETUP_DIR/.env"; set +a; }

declare -A RESULT
echo "▶ 전체 자동 실행 시작  (작업폴더=$WORKDIR, 반복=$MAX_ITER)"
echo "  순서: ${PROJECTS[*]}"

for slug in "${PROJECTS[@]}"; do
  echo ""
  echo "############################################################"
  echo "#  프로젝트: $slug"
  echo "############################################################"

  pdir="$WORKDIR/$slug"
  mkdir -p "$pdir/.claude" "$pdir/specs" "$pdir/docs/guide" "$pdir/harness"
  cp -r "$SETUP_DIR/.claude/agents" "$pdir/.claude/"
  cp "$SETUP_DIR/harness/run-loop.sh" "$pdir/harness/"
  cp "$SETUP_DIR/docs/guide/$slug.md" "$pdir/docs/guide/" 2>/dev/null || {
    echo "  ❌ 가이드 없음: docs/guide/$slug.md — 건너뜀"; RESULT[$slug]="가이드없음"; continue; }
  [[ -f "$SETUP_DIR/.env" ]] && cp "$SETUP_DIR/.env" "$pdir/.env"
  # 스펙 형식 참고용
  cp "$SETUP_DIR/specs/gyebu-app.spec.md" "$pdir/specs/_TEMPLATE.spec.md" 2>/dev/null || true

  ( cd "$pdir" || exit 1

    # ── ② 스펙 준비: 있으면 복사, 없으면 자동 생성 ──
    if [[ -f "$SETUP_DIR/specs/$slug.spec.md" ]]; then
      cp "$SETUP_DIR/specs/$slug.spec.md" "specs/$slug.spec.md"
      echo "  · 스펙 복사됨: specs/$slug.spec.md"
    else
      echo "  · 스펙 자동 생성 중…"
      claude -p "@docs/guide/$slug.md 를 읽고, @specs/_TEMPLATE.spec.md 와 동일한 형식으로 \
specs/$slug.spec.md 를 만들어줘. 코드는 만들지 말고 스펙만. \
가이드의 미션/핵심구조/제출물을 전부 '검증 가능한 인수기준(AC)'으로 변환하고, \
각 AC에 verifier가 실제로 확인할 방법을 한 줄씩 붙여줘. \
빌드형 프로젝트면 빌드/실행/DB 검증을, 에이전트/문서형이면 샘플 질문 루브릭이나 산출물 존재 검증을 기준으로." \
        --permission-mode acceptEdits 2>&1 | tail -n 5
    fi

    if [[ ! -f "specs/$slug.spec.md" ]]; then
      echo "  ❌ 스펙 생성 실패 — 건너뜀"; exit 3
    fi

    # ── 사람 개입 필요 프로젝트: 프롬프트만 안내하고 건너뜀 ──
    if [[ "$NEEDS_HUMAN" == *" $slug "* ]]; then
      echo ""
      echo "  ✋ '$slug' 은 사람이 직접 로그인/확인이 필요해 자동 실행을 건너뜁니다."
      echo "     아래 폴더에서 'claude' 를 열고 이 프롬프트를 붙여넣어 진행하세요:"
      echo "     폴더: $pdir"
      echo "     ----------------------------------------------------------------"
      echo "     conductor 에이전트로 $slug 를 진행해줘. @specs/$slug.spec.md 와"
      echo "     @docs/guide/$slug.md 만 기준으로, 내가 직접 로그인/확인할 부분은"
      echo "     멈춰서 알려주고, builder→verifier 루프로 VERDICT: PASS 까지 진행해."
      echo "     ----------------------------------------------------------------"
      exit 9   # 사람 개입 표식
    fi

    # ── ③ 자동 루프 ──
    bash harness/run-loop.sh "$slug" "$MAX_ITER"
  )
  code=$?
  case $code in
    0) RESULT[$slug]="✅ 성공" ;;
    9) RESULT[$slug]="✋ 수동 필요(프롬프트 안내됨)" ;;
    2) RESULT[$slug]="⚠️ ${MAX_ITER}회 내 미통과(에스컬레이션)" ;;
    3) RESULT[$slug]="❌ 스펙 생성 실패" ;;
    *) RESULT[$slug]="❌ 오류(code=$code)" ;;
  esac
  echo "  → 결과: ${RESULT[$slug]}"
done

echo ""
echo "================= 전체 요약 ================="
n=1
for slug in "${PROJECTS[@]}"; do
  printf "%d. %-22s %s\n" "$n" "$slug" "${RESULT[$slug]:-건너뜀}"
  n=$((n+1))
done
echo "============================================="
echo "로그: 각 $WORKDIR/<slug>/harness/logs/ 참고"
