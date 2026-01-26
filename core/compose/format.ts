interface CompressedSource {
  id: string;
  title: string;
  content: string;
  relevance: number;
}

type RelevanceTier = "high" | "medium" | "low";

interface TieredSources {
  high: CompressedSource[];
  medium: CompressedSource[];
  low: CompressedSource[];
}

/**
 * Determine the relevance tier for a source
 * - High: relevance >= 0.8
 * - Medium: relevance >= 0.65
 * - Low: relevance < 0.65 (but above threshold)
 */
const getTier = (relevance: number): RelevanceTier => {
  if (relevance >= 0.8) return "high";
  if (relevance >= 0.65) return "medium";
  return "low";
};

/**
 * Group sources by relevance tier
 */
const groupByTier = (sources: CompressedSource[]): TieredSources => {
  const tiers: TieredSources = { high: [], medium: [], low: [] };

  for (const source of sources) {
    const tier = getTier(source.relevance);
    tiers[tier].push(source);
  }

  return tiers;
};

/**
 * Format a single source as markdown
 */
const formatSource = (source: CompressedSource): string => {
  return `### ${source.title} (relevance: ${source.relevance.toFixed(2)})

${source.content}`;
};

/**
 * Format a tier section as markdown
 */
const formatTier = (
  tierName: string,
  sources: CompressedSource[],
): string | null => {
  if (sources.length === 0) return null;

  const header = `## ${tierName} Relevance Sources`;
  const formattedSources = sources.map(formatSource).join("\n\n");

  return `${header}\n\n${formattedSources}`;
};

/**
 * Format all compressed sources into hierarchical markdown
 * @param prompt - The task/prompt for context
 * @param sources - Compressed sources with their content and relevance
 * @param threshold - The relevance threshold used
 * @returns Formatted markdown string
 */
export const formatMarkdown = (
  prompt: string,
  sources: CompressedSource[],
  threshold: number,
): string => {
  const tiers = groupByTier(sources);

  const sections: string[] = [`# Context for: ${prompt}`];

  const highSection = formatTier("High", tiers.high);
  if (highSection) sections.push(highSection);

  const mediumSection = formatTier("Medium", tiers.medium);
  if (mediumSection) sections.push(mediumSection);

  const lowSection = formatTier("Low", tiers.low);
  if (lowSection) sections.push(lowSection);

  sections.push(
    `---\n*Composed from ${sources.length} sources. Threshold: ${threshold}*`,
  );

  return sections.join("\n\n");
};
