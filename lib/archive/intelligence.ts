import {
  getGlobalStats,
  getIndustryCounts,
  getOldestCase,
  getCaseByCompanyName,
  getTopCasesByFunding,
  getTotalFundingByIndustry,
  listCaseStudies,
} from '@/lib/db/case-studies';

export interface ArchiveReport {
  type: 'archive_stats' | 'company_lookup' | 'industry_breakdown' | 'comparison' | 'general';
  summary: string;
  verifiedData: string;
  retrievedCases: Array<{ company_name: string; summary: string; slug: string }>;
}

interface ParsedIntent {
  queryType: ArchiveReport['type'];
  companyName?: string;
  industry?: string;
}

function detectIntent(text: string): ParsedIntent {
  const lower = text.toLowerCase().trim();

  // Archive stats queries: counts, totals, how many
  const statsPatterns = [
    /how many/i, /total (number|count|amount)/i, /count of/i,
    /number of.*(case|startup|compan)/i, /archive.*(size|count|stat)/i,
    /database.*(size|count|stat)/i, /how (much|big|large)/i,
    /what.*(total|count)/i, /tell me.*(count|number|total|stats)/i,
  ];
  if (statsPatterns.some(p => p.test(lower))) {
    const industryMatch = lower.match(/(?:in|for|by|about)\s+(the\s+)?(\w+(?:\s+\w+)?)\s+(industry|sector|vertical|space)/i);
    return {
      queryType: 'archive_stats',
      industry: industryMatch?.[2]?.toLowerCase(),
    };
  }

  // Industry-specific queries
  const industryPatterns = [
    /how many.*(?:fintech|saas|ecommerce|health|edtech|ai|blockchain|crypto|marketplace|social|consumer|enterprise|biotech|cleantech)/i,
    /industry.*(?:breakdown|distribution|count|list)/i,
    /what.*(?:industr|sector|categor)/i,
    /per.*(?:industr|sector)/i,
    /(?:breakdown|distribution).*(?:industr|sector)/i,
  ];
  if (industryPatterns.some(p => p.test(lower))) {
    const match = lower.match(/(fintech|saas|ecommerce|health|edtech|ai|blockchain|crypto|marketplace|social|consumer|enterprise|biotech|cleantech)/i);
    return {
      queryType: 'industry_breakdown',
      industry: match?.[1]?.toLowerCase(),
    };
  }

  // Company lookup queries
  const companyPatterns = [
    /what happened to/i, /tell me about/i, /analyze/i, /why did/i,
    /how did/i, /show me.*(case|company|startup)/i, /look up/i,
    /find.*(company|startup|case)/i, /investigate/i,
  ];
  if (companyPatterns.some(p => p.test(lower))) {
    // Try to extract company name
    const companyMatch = lower.match(/(?:about|to|did|me|up)\s+(?:the\s+)?([a-zA-Z][a-zA-Z0-9\s.&'-]{1,40}?)(?:\s*\?|$|\s+(:?startup|company|failure|case|story|history)\b)/i);
    return {
      queryType: 'company_lookup',
      companyName: companyMatch?.[1]?.trim(),
    };
  }

  // Comparison queries
  const comparisonPatterns = [
    /compare/i, /difference between/i, /similarities/i,
    /vs\.?/i, /versus/i, /which (?:is|was) (?:worse|better)/i,
    /both.*and/i, /how.*(?:compare|differ)/i,
  ];
  if (comparisonPatterns.some(p => p.test(lower))) {
    const companies = text.match(/\[\[(.*?)\]\]/g);
    if (companies) {
      return {
        queryType: 'comparison',
        companyName: companies.map(c => c.replace(/\[\[|\]\]/g, '').trim()).join(' | '),
      };
    }
  }

  // Pattern queries
  const patternPatterns = [
    /failure pattern/i, /pattern of failure/i, /why.*fail/i,
    /common.*fail/i, /recurring.*fail/i, /pattern.*fail/i,
  ];
  if (patternPatterns.some(p => p.test(lower))) {
    return { queryType: 'general' };
  }

  return { queryType: 'general' };
}

export async function queryArchive(userMessage: string): Promise<ArchiveReport> {
  const intent = detectIntent(userMessage);

  switch (intent.queryType) {
    case 'archive_stats': {
      const [stats, industryCounts, totalCases, oldestCase] = await Promise.all([
        getGlobalStats(),
        getIndustryCounts(),
        getTopCasesByFunding(3),
        getOldestCase(),
      ]);

      const lines: string[] = [];

      if (stats.totalCases > 0) {
        lines.push(`VERIFIED_ARCHIVE_DATA:`);
        lines.push(`- Total published case studies: ${stats.totalCases}`);
        lines.push(`- Total funding tracked across all cases: $${(stats.totalBurned / 1_000_000_000).toFixed(2)}B`);

        if (industryCounts.length > 0) {
          lines.push(`- Industries represented: ${industryCounts.length}`);
          const topIndustries = industryCounts.slice(0, 5);
          topIndustries.forEach(({ industry, count }) => {
            lines.push(`  - ${industry}: ${count} case(s)`);
          });
        }

        if (oldestCase) {
          lines.push(`- Oldest case: [[${oldestCase.company_name}]] (founded ${oldestCase.founded_year || 'unknown'})`);
        }

        if (totalCases.length > 0) {
          lines.push(`- Highest-funded cases: ${totalCases.map(c => `[[${c.company_name}]] ($${(c.funding_raised / 1_000_000).toFixed(0)}M)`).join(', ')}`);
        }
      } else {
        lines.push('VERIFIED_ARCHIVE_DATA: The archive exists but current statistics are unavailable. Do not fabricate counts.');
      }

      return {
        type: 'archive_stats',
        summary: 'Archive statistics retrieved from database.',
        verifiedData: lines.join('\n'),
        retrievedCases: totalCases.map(c => ({
          company_name: c.company_name,
          summary: `Raised $${(c.funding_raised / 1_000_000).toFixed(0)}M, shut down ${c.shutdown_year || 'unknown'}`,
          slug: c.slug,
        })),
      };
    }

    case 'industry_breakdown': {
      const [industryCounts, fundingByIndustry] = await Promise.all([
        getIndustryCounts(),
        getTotalFundingByIndustry(),
      ]);

      if (industryCounts.length === 0) {
        return {
          type: 'industry_breakdown',
          summary: 'Industry breakdown not available.',
          verifiedData: 'ARCHIVE_INDUSTRY_DATA: Industry breakdown data is not currently available.',
          retrievedCases: [],
        };
      }

      const lines: string[] = ['ARCHIVE_INDUSTRY_DATA:'];
      const targetIndustry = intent.industry;

      if (targetIndustry) {
        const match = industryCounts.find(i => i.industry.toLowerCase().includes(targetIndustry));
        if (match) {
          const funding = fundingByIndustry.find(f => f.industry === match.industry);
          lines.push(`- ${match.industry}: ${match.count} case(s)`);
          if (funding) {
            lines.push(`  Total funding: $${(funding.totalFunding / 1_000_000).toFixed(0)}M`);
          }
        } else {
          lines.push(`- No cases found for industry matching "${targetIndustry}"`);
          lines.push(`- Available industries: ${industryCounts.map(i => i.industry).join(', ')}`);
        }
      } else {
        lines.push(`Total industries represented: ${industryCounts.length}`);
        industryCounts.slice(0, 10).forEach(({ industry, count }) => {
          const funding = fundingByIndustry.find(f => f.industry === industry);
          const fundingStr = funding ? ` ($${(funding.totalFunding / 1_000_000).toFixed(0)}M tracked)` : '';
          lines.push(`- ${industry}: ${count} case(s)${fundingStr}`);
        });
        if (industryCounts.length > 10) {
          lines.push(`- ... and ${industryCounts.length - 10} more industries`);
        }
      }

      return {
        type: 'industry_breakdown',
        summary: 'Industry breakdown retrieved from database.',
        verifiedData: lines.join('\n'),
        retrievedCases: [],
      };
    }

    case 'company_lookup': {
      if (!intent.companyName) {
        return {
          type: 'general',
          summary: 'Could not identify a specific company.',
          verifiedData: '',
          retrievedCases: [],
        };
      }

      const company = await getCaseByCompanyName(intent.companyName);
      if (company) {
        return {
          type: 'company_lookup',
          summary: `Found case study: [[${company.company_name}]].`,
          verifiedData: `ARCHIVE_CASE_FOUND:
- Company: [[${company.company_name}]]
- Industry: ${company.industry || 'Unknown'}
- Founded: ${company.founded_year || 'Unknown'} | Shut down: ${company.shutdown_year || 'Unknown'}
- Funding raised: $${(company.funding_raised || 0).toLocaleString()}
- Summary: ${company.summary}
- Failure reasons: ${(company.failure_reasons || []).join(', ')}
- Key lessons: ${(company.lessons || []).join(', ')}
- Tags: ${(company.tags || []).join(', ')}`,
          retrievedCases: [{
            company_name: company.company_name,
            summary: company.summary,
            slug: company.slug,
          }],
        };
      }

      // Try general search
      const results = await listCaseStudies({
        search: intent.companyName,
        limit: 3,
      });

      if (results.length > 0) {
        return {
          type: 'company_lookup',
          summary: `No exact match for "${intent.companyName}", but found similar cases in the archive.`,
          verifiedData: `ARCHIVE_SEARCH_RESULTS: No exact match for "${intent.companyName}". Similar cases found: ${results.map(c => `[[${c.company_name}]]`).join(', ')}. Use these if relevant, or rely on general business knowledge.`,
          retrievedCases: results.map(c => ({
            company_name: c.company_name,
            summary: c.summary,
            slug: c.slug,
          })),
        };
      }

      return {
        type: 'company_lookup',
        summary: `"${intent.companyName}" is not in the archive.`,
        verifiedData: `ARCHIVE_NOTE: "${intent.companyName}" is not found in the current Startup Graveyard archive. Rely on general business knowledge. Do not fabricate case study details.`,
        retrievedCases: [],
      };
    }

    case 'comparison': {
      const companies = (intent.companyName || '').split(' | ').filter(Boolean);
      if (companies.length < 2) {
        return { type: 'general', summary: '', verifiedData: '', retrievedCases: [] };
      }

      const results = await Promise.all(
        companies.map(name => getCaseByCompanyName(name))
      );

      const found = results.filter((r): r is NonNullable<typeof r> => r !== null);
      if (found.length === 0) {
        return {
          type: 'general',
          summary: '',
          verifiedData: 'ARCHIVE_NOTE: None of the mentioned companies were found in the archive. Use general business knowledge.',
          retrievedCases: [],
        };
      }

      const lines: string[] = ['ARCHIVE_COMPARISON_DATA:'];
      found.forEach(c => {
        lines.push(`- [[${c.company_name}]]:`);
        lines.push(`  Industry: ${c.industry || 'Unknown'}`);
        lines.push(`  Founded: ${c.founded_year || '?'} → Shut down: ${c.shutdown_year || '?'}`);
        lines.push(`  Raised: $${(c.funding_raised || 0).toLocaleString()}`);
        lines.push(`  Failure reasons: ${(c.failure_reasons || []).join(', ')}`);
        lines.push(`  Key lesson: ${(c.lessons || []).slice(0, 2).join('; ')}`);
      });

      if (found.length < companies.length) {
        const foundNames = new Set(found.map(r => r.company_name.toLowerCase()));
        const missing = companies.filter(n => !foundNames.has(n.toLowerCase()));
        lines.push(`Note: "${missing.join(', ')}" not found in archive.`);
      }

      return {
        type: 'comparison',
        summary: `Found ${found.length} of ${companies.length} companies in the archive.`,
        verifiedData: lines.join('\n'),
        retrievedCases: found.map(c => ({
          company_name: c.company_name,
          summary: c.summary,
          slug: c.slug,
        })),
      };
    }

    default: {
      return {
        type: 'general',
        summary: '',
        verifiedData: '',
        retrievedCases: [],
      };
    }
  }
}
