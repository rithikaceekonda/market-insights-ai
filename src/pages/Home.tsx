/**
 * Home Page Component
 * Landing page explaining the problem and solution of Market Mind
 * Features: Hero section, problem statement, solution overview, features, CTA
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Brain,
  TrendingUp,
  MessageSquare,
  Target,
  Zap,
  BarChart3,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Feature card data
const features = [
  {
    icon: Upload,
    title: "Easy Data Upload",
    description: "Simply upload your CSV files containing sales data, customer feedback, or marketing metrics.",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Our generative AI processes your data to extract meaningful patterns and insights.",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description: "View beautiful charts and graphs that make complex data easy to understand.",
  },
  {
    icon: Target,
    title: "Actionable Recommendations",
    description: "Get specific, data-driven recommendations to improve your sales strategy.",
  },
];

// Problem points
const problems = [
  "Drowning in spreadsheets with no clear insights",
  "Missing sales opportunities hidden in customer data",
  "Spending hours on manual data analysis",
  "Struggling to understand customer sentiment",
];

// Solution benefits
const solutions = [
  "Instant AI-powered insights from your data",
  "Automatic trend detection and forecasting",
  "Sentiment analysis on customer feedback",
  "Clear, actionable recommendations",
];

const Home = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Powered by Generative AI</span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Transform Your Data Into{" "}
              <span className="gradient-text text-glow">Actionable Intelligence</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Market Mind uses cutting-edge generative AI to analyze your sales and marketing data,
              delivering insights that drive real business growth.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  Launch Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            {[
              { value: "10x", label: "Faster Analysis" },
              { value: "85%", label: "Accuracy Rate" },
              { value: "24/7", label: "AI Availability" },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-6 text-center float"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-destructive">The Problem</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Businesses today are overwhelmed with data but starved for insights.
                Manual analysis is slow, error-prone, and misses critical patterns.
              </p>
              <ul className="space-y-3">
                {problems.map((problem, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{problem}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">
                <span className="gradient-text">Our Solution</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Market Mind harnesses the power of generative AI to instantly transform
                your raw data into strategic intelligence.
              </p>
              <ul className="space-y-3">
                {solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{solution}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get from raw data to actionable insights in minutes, not days.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-xl p-6 hover:border-primary/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass-card rounded-2xl p-8 sm:p-12 text-center overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />

            <div className="relative z-10">
              <Zap className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Unlock Your Data's Potential?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Start analyzing your sales and marketing data with AI today.
                No technical expertise required.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  Try It Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-semibold">Market Mind</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Market Mind AI continuously analyzes market signals and customer data to
              surface trends, opportunities, and competitive insights — turning raw data
              into clear, actionable business decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
