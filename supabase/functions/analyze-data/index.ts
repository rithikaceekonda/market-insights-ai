/**
 * Market Mind AI Analysis Edge Function
 *
 * Analyzes CSV data using Lovable AI to provide:
 * - Sentiment analysis for text data (reviews, feedback)
 * - Sales trend analysis for numerical data
 * - Human-readable insights and recommendations
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CSVRow {
  [key: string]: unknown;
}

interface AnalysisRequest {
  csvData: CSVRow[];
  fileName?: string;
}

// Detect if data contains text fields suitable for sentiment analysis
function hasTextData(data: CSVRow[]): boolean {
  if (data.length === 0) return false;

  const firstRow = data[0];
  const columns = Object.keys(firstRow);

  // Look for columns that might contain text feedback
  const textIndicators = ['review', 'feedback', 'comment', 'text', 'message', 'description', 'note', 'response'];

  for (const col of columns) {
    const colLower = col.toLowerCase();
    if (textIndicators.some(indicator => colLower.includes(indicator))) {
      return true;
    }

    // Check if values are long strings (likely text data)
    const sampleValue = String(firstRow[col] || '');
    if (sampleValue.length > 50 && isNaN(Number(sampleValue))) {
      return true;
    }
  }

  return false;
}

// Detect if data contains numerical sales/metrics data
function hasSalesData(data: CSVRow[]): boolean {
  if (data.length === 0) return false;

  const firstRow = data[0];
  const columns = Object.keys(firstRow);

  // Look for columns that might contain sales/metrics data
  const salesIndicators = ['sales', 'revenue', 'amount', 'price', 'quantity', 'total', 'value', 'profit', 'cost'];

  for (const col of columns) {
    const colLower = col.toLowerCase();
    if (salesIndicators.some(indicator => colLower.includes(indicator))) {
      return true;
    }
  }

  // Check if there are numeric columns
  let numericCount = 0;
  for (const col of columns) {
    const sampleValue = firstRow[col];
    if (!isNaN(Number(sampleValue)) && sampleValue !== '' && sampleValue !== null) {
      numericCount++;
    }
  }

  return numericCount >= 2;
}

// Format data for AI analysis
function formatDataForAnalysis(data: CSVRow[], analysisType: 'sentiment' | 'sales_trend'): string {
  const columns = Object.keys(data[0] || {});
  const sampleRows = data.slice(0, 20); // Limit to 20 rows for analysis

  let formatted = `Columns: ${columns.join(', ')}\n\nSample data (${sampleRows.length} of ${data.length} rows):\n`;

  for (const row of sampleRows) {
    const rowValues = columns.map(col => `${col}: ${row[col]}`).join(' | ');
    formatted += `- ${rowValues}\n`;
  }

  return formatted;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }


  try {
    // Reject methods other than POST after handling CORS preflight.
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initial request and CSV limits.
    const MAX_REQUEST_BYTES = 2 * 1024 * 1024;
    const MAX_ROWS = 10_000;
    const MAX_COLUMNS = 100;
    const MAX_CELL_CHARS = 20_000;

    // Check the declared size before reading the body.
    const contentLength = req.headers.get("content-length");

    if (
      contentLength !== null &&
      Number.isFinite(Number(contentLength)) &&
      Number(contentLength) > MAX_REQUEST_BYTES
    ) {
      return new Response(
        JSON.stringify({ error: "Request too large. Maximum size is 2 MB." }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Also check the actual body size; do not rely only on Content-Length.
    const rawBody = await req.text();
    const actualSize = new TextEncoder().encode(rawBody).byteLength;

    if (actualSize > MAX_REQUEST_BYTES) {
      return new Response(
        JSON.stringify({ error: "Request too large. Maximum size is 2 MB." }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let parsedBody: AnalysisRequest;

    try {
      parsedBody = JSON.parse(rawBody) as AnalysisRequest;
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { csvData, fileName }: AnalysisRequest = parsedBody;

    if (!Array.isArray(csvData) || csvData.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid CSV data provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (csvData.length > MAX_ROWS) {
      return new Response(
        JSON.stringify({ error: `Too many rows. Maximum is ${MAX_ROWS}.` }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate row objects, column counts, and cell values.
    for (const row of csvData) {
      if (
        row === null ||
        typeof row !== "object" ||
        Array.isArray(row)
      ) {
        return new Response(
          JSON.stringify({ error: "Each CSV row must be an object." }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const entries = Object.entries(row);

      if (entries.length > MAX_COLUMNS) {
        return new Response(
          JSON.stringify({
            error: `Too many columns. Maximum is ${MAX_COLUMNS}.`,
          }),
          {
            status: 413,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      for (const [key, value] of entries) {
        if (key.length > 200) {
          return new Response(
            JSON.stringify({ error: "A column name is too long." }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (
          value !== null &&
          !["string", "number", "boolean"].includes(typeof value)
        ) {
          return new Response(
            JSON.stringify({ error: "Unsupported CSV cell value." }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (typeof value === "string" && value.length > MAX_CELL_CHARS) {
          return new Response(
            JSON.stringify({ error: "A CSV cell exceeds the allowed length." }),
            {
              status: 413,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Determine analysis type based on data structure
    const hasText = hasTextData(csvData);
    const hasSales = hasSalesData(csvData);
    const analysisType = hasText ? 'sentiment' : 'sales_trend';

    const formattedData = formatDataForAnalysis(csvData, analysisType);

    // Build the analysis prompt
    const systemPrompt = `You are Market Mind AI, an expert business intelligence analyst. You analyze sales and marketing data to provide actionable insights.

Your analysis should be:
1. Clear and easy to understand for business users
2. Data-driven with specific metrics
3. Actionable with concrete recommendations

Always respond in valid JSON format with this exact structure:
{
  "summary": "A 2-3 sentence summary of the key findings",
  "recommendation": "A specific, actionable business recommendation based on the data",
  "insights": [
    {
      "id": 1,
      "type": "success" | "warning" | "info" | "danger",
      "icon": "TrendingUp" | "TrendingDown" | "Users" | "MessageSquare" | "Target" | "DollarSign",
      "title": "Short insight title",
      "description": "Detailed explanation of this insight",
      "metric": "Key metric value (e.g., +23%, $5.2K)",
      "metricLabel": "What the metric represents"
    }
  ],
  "analysisType": "${analysisType}",
  "chartData": {
    "salesData": [
      { "month": "Jan", "sales": 4200, "target": 4000, "leads": 120 }
    ],
    "sentimentData": [
      { "name": "Positive", "value": 62, "color": "hsl(142, 76%, 36%)" },
      { "name": "Neutral", "value": 28, "color": "hsl(217, 33%, 40%)" },
      { "name": "Negative", "value": 10, "color": "hsl(0, 84%, 60%)" }
    ]
  }
}

Provide 3-4 insights. For chartData:
- If analyzing sales data, provide realistic salesData based on trends you observe
- If analyzing sentiment/text data, provide sentimentData with percentage breakdown
- Chart values should reflect your analysis of the actual data`;

    const userPrompt = analysisType === 'sentiment'
      ? `Analyze this customer feedback/text data for sentiment patterns and customer satisfaction trends:

${formattedData}

Identify:
1. Overall sentiment distribution (positive/neutral/negative percentages)
2. Common themes or topics in feedback
3. Areas of concern or praise
4. Trends in customer satisfaction`
      : `Analyze this sales/business data for trends, patterns, and opportunities:

${formattedData}

Identify:
1. Sales trends over time
2. Performance against targets if available
3. Key growth or decline patterns
4. Opportunities for improvement`;


    // Call the Google Gemini API

    let response: Response | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
        {
          method: "POST",
          headers: {
            "x-goog-api-key": GEMINI_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      // Retry only temporary server overloads.
      // A 429 may indicate an exhausted quota, so do not retry it.
      if (response.ok || response.status !== 503 || attempt === 2) {
        break;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (2 ** attempt))
      );
    }

    if (!response) {
      throw new Error("Gemini request did not complete");
    }


    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Gemini API quota or rate limit reached. Please wait for quota reset or check your API plan and billing.",
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      throw new Error(`Gemini analysis failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("");

    if (!content) {
      throw new Error("Gemini returned no text response");
    }


    // Parse the JSON response from AI
    let analysisResult;
    try {
      // Extract JSON from potential markdown code blocks
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Data-aware fallback: generate a simple, deterministic analysis based on csvData
      const columns = Object.keys(csvData[0] || {});
      const sampleCount = csvData.length;

      // detect numeric columns
      const numericCols = columns.filter(col => csvData.some(r => r[col] !== '' && r[col] != null && !isNaN(Number(r[col]))));

      if (analysisType === 'sentiment') {
        const posWords = ['good','great','excellent','love','happy','satisfied','positive','awesome','best','pleasant'];
        const negWords = ['bad','terrible','poor','hate','angry','disappointed','negative','awful','worst','frustrat'];
        let pos = 0, neg = 0, neutral = 0;

        for (const row of csvData) {
          const text = columns.map(c => String(row[c] || '')).join(' ');
          const l = text.toLowerCase();
          const hasPos = posWords.some(w => l.includes(w));
          const hasNeg = negWords.some(w => l.includes(w));
          if (hasPos && !hasNeg) pos++;
          else if (hasNeg && !hasPos) neg++;
          else neutral++;
        }

        const total = Math.max(1, pos + neg + neutral);
        const sentimentData = [
          { name: 'Positive', value: Math.round((pos / total) * 100), color: 'hsl(142, 76%, 36%)' },
          { name: 'Neutral', value: Math.round((neutral / total) * 100), color: 'hsl(217, 33%, 40%)' },
          { name: 'Negative', value: Math.round((neg / total) * 100), color: 'hsl(0, 84%, 60%)' }
        ];

        analysisResult = {
          summary: `Processed ${sampleCount} rows. Estimated sentiment: ${sentimentData[0].value}% positive, ${sentimentData[1].value}% neutral, ${sentimentData[2].value}% negative.`,
          recommendation: neg > pos ? 'Prioritize addressing common negative themes in feedback; aggregate examples and investigate root causes.' : 'Leverage positive feedback themes in marketing and scale practices that drive satisfaction.',
          insights: [
            { id: 1, type: 'info', icon: 'MessageSquare', title: 'Rows analyzed', description: `Analyzed ${sampleCount} rows from ${fileName || 'input'}`, metric: `${sampleCount}`, metricLabel: 'rows' },
            { id: 2, type: neg > pos ? 'warning' : 'success', icon: 'MessageSquare', title: 'Sentiment overview', description: `Pos: ${sentimentData[0].value}%, Neu: ${sentimentData[1].value}%, Neg: ${sentimentData[2].value}%`, metric: `${sentimentData[0].value}%`, metricLabel: 'positive' }
          ],
          analysisType: analysisType,
          chartData: { sentimentData }
        };
      } else {
        // sales_trend fallback: try to pick a numeric column as 'sales' and build a small series
        if (numericCols.length > 0) {
          const salesCol = numericCols[0];
          const months = ['Jan','Feb','Mar','Apr','May','Jun'];
          const rawValues = csvData.map(r => Number(r[salesCol]) || 0);
          const sampleValues = rawValues.slice(0, 6);
          const salesData = sampleValues.map((v, i) => ({ month: months[i] || `P${i+1}`, sales: Math.round(v), target: Math.round(v * 0.95), leads: Math.max(0, Math.round(v / 40)) }));

          // compute simple trend: percent change from first non-zero to last
          const nonZero = rawValues.filter(v => v !== 0);
          const first = nonZero[0] ?? 0;
          const last = nonZero[nonZero.length - 1] ?? 0;
          const pctChange = first === 0 ? 0 : Math.round(((last - first) / Math.abs(first)) * 100);

          analysisResult = {
            summary: `Analyzed ${sampleCount} rows. Primary numeric column detected: ${salesCol}. Simple trend: ${pctChange >= 0 ? '+' + pctChange : pctChange}% over sampled rows.`,
            recommendation: pctChange < 0 ? `Investigate causes for decline in ${salesCol}; compare top/bottom performing rows.` : `Consider scaling channels that produced growth in ${salesCol}.`,
            insights: [
              { id: 1, type: 'info', icon: 'DollarSign', title: 'Numeric column', description: `Using '${salesCol}' as sales proxy. Sample size: ${sampleValues.length}.`, metric: `${sampleValues.reduce((a,b)=>a+b,0)}`, metricLabel: 'sample total' },
              { id: 2, type: pctChange < 0 ? 'warning' : 'success', icon: pctChange < 0 ? 'TrendingDown' : 'TrendingUp', title: 'Trend', description: `Change from first to last sample: ${pctChange}%`, metric: `${pctChange}%`, metricLabel: 'sample change' }
            ],
            analysisType: analysisType,
            chartData: { salesData }
          };
        } else {
          // no numeric columns: generic fallback referencing available columns
          analysisResult = {
            summary: `Analysis completed. ${sampleCount} rows and ${columns.length} columns processed.`,
            recommendation: 'No numeric columns detected; review CSV formatting or pick a numeric column for trend analysis.',
            insights: [
              { id: 1, type: 'info', icon: 'Info', title: 'Columns', description: `Detected columns: ${columns.join(', ')}` , metric: `${columns.length}`, metricLabel: 'columns' }
            ],
            analysisType: analysisType,
            chartData: { salesData: [] }
          };
        }
      }
    }

    return new Response(
      JSON.stringify(analysisResult),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
