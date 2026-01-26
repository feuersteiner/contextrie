import { createAzure } from "@ai-sdk/azure";
import { Contextrie } from "../client";

// Azure OpenAI configuration (see https://ai-sdk.dev/providers/ai-sdk-providers/azure)
const resourceName = "change-me";
const apiKey = "change-me";
const deploymentName = "change-me";

const azure = createAzure({ resourceName, apiKey });
const model = azure(deploymentName);

async function runDemo() {
  const ctx = new Contextrie({
    ingester: {
      model,
    },
    assessor: {
      model,
    },
    compose: {
      model,
      defaultThreshold: 0.65,
    },
  });

  console.log("Ingesting demo sources...");
  await ctx.ingest
    .file("./demo/article.md")
    .file("./demo/complaint.txt")
    .file("./demo/clauses.csv")
    .file("./demo/apex_products.md")
    .file("./demo/nexus_earnings.md")
    .run();

  console.log(
    "Sources:",
    ctx.sources.map((s) => ({ id: s.id, title: s.title })),
  );

  const task = `Nexus Financial is threatening $47M arbitration against Apex Cloud. Identify ALL contract clauses relevant to: 
    (1) 187 hours of cumulative downtime vs 99.99% SLA, 
    (2) 7-day delayed ransomware breach notification, 
    (3) failed disaster recovery and untested failover, 
    (4) $1.2M billing overcharges, 
    (5) regulatory investigation cooperation demands,
    (6) indemnification for class action and SEC enforcement,
    (7) termination rights and early termination fee waiver.
    Which clauses favor Nexus? Which might Apex use in defense?`;

  console.log("\n--- Shallow assessment (metadata only) ---");
  const shallow = await ctx.assess.task(task).from(ctx.sources).run();
  for (const rated of shallow.rated) {
    console.log(
      `${rated.source.id} (${rated.relevance}): ${rated.source.title}`,
    );
  }

  console.log("\n--- Composing context (sparse density) ---");
  const context = await ctx.compose
    .task(task)
    .from(shallow.rated)
    .density("minimal") // 'minimal'|'sparse'|'balanced'|'detailed'|'thorough' or 0-1
    .run();

  console.log(context);
}

runDemo().catch((err) => {
  console.error(err);
  process.exit(1);
});
