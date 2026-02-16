import "dotenv/config";

import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`AI Ops Studio API listening on http://localhost:${env.PORT}`);
});
