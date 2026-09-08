import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const backendDirectory = fileURLToPath(new URL("../backend/", import.meta.url));
const gradleWrapper = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const result = spawnSync(
  gradleWrapper,
  ["spotlessCheck", "test", "bootJar"],
  {
    cwd: backendDirectory,
    shell: process.platform === "win32",
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(`백엔드 검증 실행 실패: ${result.error.message}`);
}

process.exit(result.status ?? 1);
