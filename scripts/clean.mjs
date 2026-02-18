import { rmSync } from "node:fs";

const targets = [
  "apps/api/dist",
  "apps/web/dist",
  "packages/shared/dist",
  "prisma/generated",
  "coverage"
];

for (const target of targets) {
  rmSync(target, { recursive: true, force: true });
}
