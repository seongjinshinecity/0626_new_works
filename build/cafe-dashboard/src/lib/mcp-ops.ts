// MCP 클라이언트: 'cafe-ops' MCP 서버를 stdio로 spawn → listTools/callTool.
// 가이드 [Auth+MCP+DB+App]의 'MCP' 소스. weather.ts처럼 실패해도 null 반환 → 위젯만 degrade, 페이지는 유지.
// ⚠️ 로컬/Node 런타임 전용. Vercel 서버리스는 stdio 서브프로세스 spawn 불가 → 자동 degrade.
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export type ReorderItem = { item: string; reason: string; priority: string };
export type CafeOps = {
  date: string;
  weekday: string;
  tasks: string[];
  reorder: ReorderItem[];
};

// MCP 라운드트립 결과 + 증거(어떤 도구를 거쳤는지)
export type CafeOpsResult = { ops: CafeOps | null; tools: string[]; via: "mcp" | "degraded" };

export async function getCafeOps(): Promise<CafeOpsResult> {
  let client: Client | null = null;
  try {
    const serverPath = path.join(process.cwd(), "mcp-server", "cafe-ops-server.mjs");
    const transport = new StdioClientTransport({ command: "node", args: [serverPath] });
    client = new Client({ name: "cafe-dashboard", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);

    const list = await client.listTools();
    const tools = list.tools.map((t) => t.name);

    const res = await client.callTool({ name: "get_cafe_ops", arguments: {} });
    const content = res.content as Array<{ type: string; text?: string }>;
    const text = content?.[0]?.text;
    const ops = text ? (JSON.parse(text) as CafeOps) : null;

    return { ops, tools, via: "mcp" };
  } catch (e) {
    console.error("[mcp-ops] MCP 연결 실패 → degrade:", (e as Error)?.message);
    return { ops: null, tools: [], via: "degraded" };
  } finally {
    try {
      await client?.close();
    } catch {}
  }
}
