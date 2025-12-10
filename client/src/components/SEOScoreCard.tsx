import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, TrendingUp, Eye } from "lucide-react";

interface SEOAnalysis {
  titleScore: number;
  descriptionScore: number;
  keywordDensity: number;
  readabilityScore: number;
  suggestions: string[];
}

interface SEOScoreCardProps {
  score: number;
  analysis: SEOAnalysis;
  className?: string;
}

export function SEOScoreCard({ score, analysis, className = "" }: SEOScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 75) return "secondary";
    if (score >= 60) return "outline";
    return "destructive";
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SEO Score
          </CardTitle>
          <Badge variant={getScoreBadgeVariant(score)} className="text-lg px-3 py-1">
            {score}/100
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Score Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Optimization</span>
            <span className={`font-semibold ${getScoreColor(score)}`}>
              {score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 60 ? "Fair" : "Needs Work"}
            </span>
          </div>
          <Progress 
            value={score} 
            className="h-2"
            style={{
              background: `linear-gradient(to right, ${getProgressColor(score)} ${score}%, #e5e7eb ${score}%)`
            }}
          />
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Title</span>
              <span className="font-medium">{analysis.titleScore}%</span>
            </div>
            <Progress value={analysis.titleScore} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Description</span>
              <span className="font-medium">{analysis.descriptionScore}%</span>
            </div>
            <Progress value={analysis.descriptionScore} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Keywords</span>
              <span className="font-medium">{analysis.keywordDensity}%</span>
            </div>
            <Progress value={analysis.keywordDensity} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Readability</span>
              <span className="font-medium">{analysis.readabilityScore}%</span>
            </div>
            <Progress value={analysis.readabilityScore} className="h-1" />
          </div>
        </div>

        {/* Suggestions */}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Optimization Tips
            </h4>
            <div className="space-y-2">
              {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  {index === 0 && score >= 90 ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-gray-600">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 