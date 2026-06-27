#!/usr/bin/env node
// 카페 운영(할일/발주) MCP 서버 — stdio.
// 가이드의 "Notion MCP(할일/발주)" 자리를 대체하는 자체 MCP 소스(외부 인증 불필요).
// 대시보드(Next 서버)가 MCP 클라이언트로 spawn → listTools/callTool 로 소비한다.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 요일 기반 운영 할일/발주 추천 (데일리브루 맥락: 주말 디저트 매진·주방 협소).
function opsFor(date) {
  const dow = date.getDay(); // 0=일
  const isWeekendEve = dow === 4 || dow === 5; // 목·금: 주말 대비
  const isWeekend = dow === 0 || dow === 6;

  const tasks = [
    "오픈 전 원두·우유 재고 점검",
    "디저트 쇼케이스 청소 및 온도 확인",
  ];
  const reorder = [];

  if (isWeekendEve) {
    tasks.push("주말 피크 대비 크로플 반죽·치즈케이크 시트 추가 준비");
    reorder.push({ item: "크림치즈", reason: "주말 치즈케이크 수요 증가", priority: "높음" });
    reorder.push({ item: "냉동 크로와상 생지", reason: "크로플 주말 매진 잦음", priority: "높음" });
  } else if (isWeekend) {
    tasks.push("디저트 품절 시간 기록(다음 주 발주 참고)");
    tasks.push("대기 동선 안내 — 좌석 회전 관리(24석 한계)");
    reorder.push({ item: "테이크아웃 박스/캐리어", reason: "주말 포장 수요", priority: "중간" });
  } else {
    tasks.push("평일 한산 시간대 신메뉴 테스트 준비");
    reorder.push({ item: "우유", reason: "상시 소비", priority: "중간" });
  }

  // 로컬 날짜 문자열(toISOString은 UTC라 KST에서 하루 밀림)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return {
    date: `${y}-${m}-${d}`,
    weekday: WEEKDAYS[dow],
    tasks,
    reorder,
  };
}

const server = new Server(
  { name: "cafe-ops", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_cafe_ops",
      description:
        "오늘의 카페 운영 할일과 발주 추천을 반환한다(요일 기반). 데일리브루 제약(좌석 24석·주방 협소·주말 디저트 매진) 반영.",
      inputSchema: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "기준 날짜 YYYY-MM-DD (생략 시 오늘)",
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name !== "get_cafe_ops") {
    throw new Error(`Unknown tool: ${req.params.name}`);
  }
  const arg = req.params.arguments?.date;
  const date = arg ? new Date(arg + "T00:00:00") : new Date();
  const result = opsFor(date);
  return {
    content: [{ type: "text", text: JSON.stringify(result) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
