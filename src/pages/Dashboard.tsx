/**
 * Dashboard Page Component
 * Main analytics dashboard with file upload, AI analysis, and visualizations
 * Features: CSV upload, analysis trigger, insight cards, charts
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import {
  Upload,
  Brain,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  MessageSquare,
  Target,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  LineChart,
  PieChart,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type definitions for AI analysis response
interface AIInsight {
  id: number;
  type: "success" | "warning" | "info" | "danger";
  icon: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}

interface AnalysisResponse {
  summary: string;
  recommendation: string;
  insights: AIInsight[];
  analysisType: "sentiment" | "sales_trend";
  chartData?: {
    salesData?: Array<{ month: string; sales: number; target: number; leads: number }>;
    sentimentData?: Array<{ name: string; value: number; color: string }>;
  };
}

// Example placeholder sales array (unused for AI-driven metrics)
// const sales = [ { amount: 65000, status: "converted" }, ... ];

// Default chart data (used before analysis)
const defaultSalesData = [
  { month: "Jan", sales: 4200, target: 4000, leads: 120 },
  { month: "Feb", sales: 3800, target: 4200, leads: 98 },
  { month: "Mar", sales: 5100, target: 4500, leads: 145 },
  { month: "Apr", sales: 4700, target: 4800, leads: 132 },
  { month: "May", sales: 5800, target: 5000, leads: 167 },
  { month: "Jun", sales: 6200, target: 5500, leads: 189 },
];

const defaultSentimentData = [
  { name: "Positive", value: 62, color: "hsl(142, 76%, 36%)" },
  { name: "Neutral", value: 28, color: "hsl(217, 33%, 40%)" },
  { name: "Negative", value: 10, color: "hsl(0, 84%, 60%)" },
];

// Icon mapping for dynamic insights
const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Target,
  DollarSign,
  Brain,
};

// Insight card type styles
const insightStyles = {
  success: "border-success/30 bg-success/5",
  warning: "border-warning/30 bg-warning/5",
  info: "border-primary/30 bg-primary/5",
  danger: "border-destructive/30 bg-destructive/5",
};

const insightIconStyles = {
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  info: "bg-primary/20 text-primary",
  danger: "bg-destructive/20 text-destructive",
};

const Dashboard = () => {
  // State for file upload and analysis
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<Record<string, unknown>[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chart data state
  const [salesData, setSalesData] = useState(defaultSalesData);
  const [sentimentData, setSentimentData] = useState(defaultSentimentData);

  // Parse CSV file
  const parseCSV = (file: File): Promise<Record<string, unknown>[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          resolve(results.data as Record<string, unknown>[]);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  // Handle file selection
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setUploadedFile(file);
      setAnalysisComplete(false);
      setAnalysisResult(null);
      setError(null);
      
      try {
        const data = await parseCSV(file);
        setCsvData(data);
      } catch (err) {
        toast.error("Failed to parse CSV file");
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      setUploadedFile(file);
      setAnalysisComplete(false);
      setAnalysisResult(null);
      setError(null);
      
      try {
        const data = await parseCSV(file);
        setCsvData(data);
      } catch (err) {
        toast.error("Failed to parse CSV file");
      }
    }
  }, []);

  // Real AI analysis using edge function
  const handleAnalysis = async () => {
    if (!csvData) {
      toast.error("Please upload a CSV file first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-data", {
        body: { 
          csvData: csvData.slice(0, 100), // Limit to first 100 rows for performance
          fileName: uploadedFile?.name 
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      setAnalysisResult(data as AnalysisResponse);
      
      // Update chart data if provided
      if (data.chartData?.salesData) {
        setSalesData(data.chartData.salesData);
      }
      if (data.chartData?.sentimentData) {
        setSentimentData(data.chartData.sentimentData);
      }

      setAnalysisComplete(true);
      toast.success("Analysis complete!");
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Analysis failed");
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear uploaded file
  const clearFile = () => {
    setUploadedFile(null);
    setCsvData(null);
    setAnalysisComplete(false);
    setAnalysisResult(null);
    setError(null);
    setSalesData(defaultSalesData);
    setSentimentData(defaultSentimentData);
  };

  // Get insights to display
  const displayInsights = analysisResult?.insights || [];

  // Compute key metrics using available AI results, chart data, or raw CSV
  const computeKeyMetrics = () => {
    let totalRevenue = 0;
    let avgDealSize = 0;
    let conversionRate: number | null = null;
    let customerLTV: string | null = null;

    // Prefer sales data returned by AI (salesData)
    if (salesData && salesData.length) {
      totalRevenue = salesData.reduce((s, r) => s + (Number((r as any).sales) || 0), 0);
      avgDealSize = Math.round(totalRevenue / Math.max(1, salesData.length));
    }

    // Fallback: inspect uploaded CSV for numeric revenue-like columns
    if ((!totalRevenue || totalRevenue === 0) && csvData && csvData.length) {
      const numericIndicators = ['sales', 'revenue', 'amount', 'price', 'value', 'total', 'profit'];
      const cols = Object.keys(csvData[0] || {});
      const numCol = cols.find((c) => numericIndicators.some((ind) => c.toLowerCase().includes(ind)));
      if (numCol) {
        const sum = csvData.reduce((s, r) => s + (Number(r[numCol]) || 0), 0);
        totalRevenue = sum;
        avgDealSize = Math.round(sum / Math.max(1, csvData.length));
      }
    }

    // Conversion rate: look for status/converted-like column in CSV
    let conversionChangePct: number | null = null;
    if (csvData && csvData.length) {
      const statusCol = Object.keys(csvData[0]).find((c) => ['status', 'converted', 'is_converted'].some(k => c.toLowerCase().includes(k)));
      if (statusCol) {
        const converted = csvData.filter(r => {
          const v = String(r[statusCol] || '').toLowerCase();
          return v.includes('convert') || v.includes('yes') || v === '1' || v === 'true';
        }).length;
        conversionRate = Math.round((converted / csvData.length) * 100);

        // compute simple change percent comparing first and second half of CSV
        if (csvData.length >= 4) {
          const mid = Math.floor(csvData.length / 2);
          const firstHalf = csvData.slice(0, mid);
          const secondHalf = csvData.slice(mid);
          const firstConverted = firstHalf.filter(r => {
            const v = String(r[statusCol] || '').toLowerCase();
            return v.includes('convert') || v.includes('yes') || v === '1' || v === 'true';
          }).length;
          const secondConverted = secondHalf.filter(r => {
            const v = String(r[statusCol] || '').toLowerCase();
            return v.includes('convert') || v.includes('yes') || v === '1' || v === 'true';
          }).length;
          const firstRate = firstConverted / Math.max(1, firstHalf.length);
          const secondRate = secondConverted / Math.max(1, secondHalf.length);
          conversionChangePct = Math.round(((secondRate - firstRate) / Math.max(0.0001, firstRate)) * 100);
        }
      }
    }

    // Customer LTV: try to extract from AI insights, else estimate from avgDealSize
    if (analysisResult && analysisResult.insights) {
      const ltvInsight = analysisResult.insights.find(i => i.title.toLowerCase().includes('ltv') || i.metricLabel.toLowerCase().includes('ltv') || i.title.toLowerCase().includes('customer'));
      if (ltvInsight && ltvInsight.metric) {
        customerLTV = String(ltvInsight.metric);
      }
    }
    if (!customerLTV && avgDealSize) {
      customerLTV = `₹${(Math.round(avgDealSize * 3)).toLocaleString('en-IN')}`;
    }

    // simple trend percent based on salesData first/last (used for revenue/avg deal/LTV growth)
    let trendPct: number | null = null;
    let ltvChangePct: number | null = null;
    if (salesData && salesData.length >= 2) {
      const nums = salesData.map(s => Number((s as any).sales) || 0).filter(n => n !== 0);
      if (nums.length >= 2) {
        const first = nums[0];
        const last = nums[nums.length - 1];
        trendPct = first === 0 ? 0 : Math.round(((last - first) / Math.abs(first)) * 100);
        ltvChangePct = trendPct;
      }
    }

    return {
      totalRevenue,
      avgDealSize,
      conversionRate,
      customerLTV,
      trendPct,
      conversionChangePct,
      ltvChangePct,
    };
  };

  const { totalRevenue, avgDealSize, conversionRate, customerLTV, trendPct, conversionChangePct, ltvChangePct } = computeKeyMetrics();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Upload your data and let AI reveal the insights
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {/* File Upload Area */}
              <div
                className={`flex-1 w-full border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragOver
                    ? "border-primary bg-primary/10"
                    : uploadedFile
                    ? "border-success/50 bg-success/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary/30"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-success" />
                    <div className="text-left">
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                        {csvData && ` • ${csvData.length} rows`}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="ml-4 p-1 rounded-full hover:bg-secondary"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium mb-1">
                      Drop your CSV file here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports sales data, customer feedback, marketing metrics
                    </p>
                  </>
                )}
              </div>

              {/* Analysis Button */}
              <div className="flex flex-col items-center gap-3">
                <Button
                  size="lg"
                  onClick={handleAnalysis}
                  disabled={!uploadedFile || isAnalyzing}
                  className="gap-2 min-w-[200px] bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : analysisComplete ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Analysis Complete
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
                {!uploadedFile && (
                  <p className="text-xs text-muted-foreground">
                    Upload a file to enable analysis
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="glass-card rounded-xl p-6 border border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Analysis Error</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="glass-card rounded-xl p-8 text-center">
                <div className="relative inline-flex mb-4">
                  <Brain className="w-16 h-16 text-primary animate-pulse" />
                  <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-bounce" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI is analyzing your data...</h3>
                <p className="text-muted-foreground mb-4">
                  Extracting insights, detecting patterns, analyzing sentiment
                </p>
                <div className="w-full max-w-xs mx-auto h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent shimmer" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Summary */}
        <AnimatePresence>
          {analysisComplete && analysisResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              {/* Summary Card */}
              <div className="glass-card rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Analysis Summary
                </h2>
                <p className="text-muted-foreground mb-4">{analysisResult.summary}</p>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <h3 className="font-semibold text-primary mb-2">💡 Recommendation</h3>
                  <p className="text-foreground">{analysisResult.recommendation}</p>
                </div>
              </div>

              {/* AI Insights Cards */}
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI-Generated Insights
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {displayInsights.map((insight, index) => {
                  const IconComponent = iconMap[insight.icon] || TrendingUp;
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`glass-card rounded-xl p-5 border ${
                        insightStyles[insight.type as keyof typeof insightStyles] || insightStyles.info
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            insightIconStyles[insight.type as keyof typeof insightIconStyles] || insightIconStyles.info
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold">{insight.title}</h3>
                            <div className="text-right flex-shrink-0">
                              <div className="font-bold text-lg gradient-text">
                                {insight.metric}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {insight.metricLabel}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Data Visualization
            {!analysisComplete && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Sample Data)
              </span>
            )}
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Sales Performance Chart */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-primary" />
                  Sales Performance
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Actual</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span className="text-muted-foreground">Target</span>
                  </div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(187, 92%, 50%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(187, 92%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                    <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 9%)",
                        border: "1px solid hsl(217, 33%, 17%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(187, 92%, 50%)"
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="hsl(262, 83%, 58%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leads Chart */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Lead Generation
                </h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                    <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 9%)",
                        border: "1px solid hsl(217, 33%, 17%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="leads"
                      fill="hsl(187, 92%, 50%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sentiment Pie Chart */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  Customer Sentiment
                </h3>
              </div>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 9%)",
                        border: "1px solid hsl(217, 33%, 17%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Stats Card */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Key Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Revenue", value: totalRevenue ? `₹${totalRevenue.toLocaleString('en-IN')}` : '-', change: trendPct !== null ? `${trendPct >= 0 ? '+' : ''}${trendPct}%` : '', positive: (trendPct ?? 0) >= 0 },
                  { label: "Avg Deal Size", value: avgDealSize ? `₹${avgDealSize.toLocaleString('en-IN')}` : '-', change: trendPct !== null ? `${trendPct >= 0 ? '+' : ''}${trendPct}%` : '', positive: (trendPct ?? 0) >= 0 },
                  { label: "Conversion Rate", value: conversionRate !== null ? `${conversionRate}%` : '-', change: conversionChangePct !== null ? `${conversionChangePct >= 0 ? '+' : ''}${conversionChangePct}%` : '', positive: (conversionChangePct ?? 0) >= 0 },
                  { label: "Customer LTV", value: customerLTV || '-', change: ltvChangePct !== null ? `${ltvChangePct >= 0 ? '+' : ''}${ltvChangePct}%` : '', positive: (ltvChangePct ?? 0) >= 0 },
                ].map((metric, index) => (
                  <div
                    key={index}
                    className="bg-secondary/30 rounded-lg p-4"
                  >
                    <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span
                        className={`text-sm flex items-center gap-1 ${
                          metric.positive ? "text-success" : "text-destructive"
                        }`}
                      >
                        {metric.positive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
