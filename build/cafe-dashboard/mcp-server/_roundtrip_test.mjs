// MCP 프로토콜 round-trip 독립 검증: Client → stdio transport → listTools → callTool.
// (SDK import만 하고 직접 함수 호출하는 '가짜 MCP'가 아님을 증명)
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(here, "cafe-ops-server.mjs");

const transport = new StdioClientTransport({ command: "node", args: [serverPath] });
const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });

await client.connect(transport);
console.log("[1] connected to MCP server via stdio");

const list = await client.listTools();
console.log("[2] listTools →", JSON.stringify(list.tools.map((t) => t.name)));

const res = await client.callTool({ name: "get_cafe_ops", arguments: {} });
console.log("[3] callTool(get_cafe_ops) →", res.content[0].text);

// 특정 날짜(금요일=주말 대비) 호출로 동적 로직도 확인
const fri = await client.callTool({ name: "get_cafe_ops", arguments: { date: "2026-06-26" } });
console.log("[4] callTool(date=2026-06-26 금) →", fri.content[0].text);

await client.close();
console.log("[5] closed — round-trip OK");
