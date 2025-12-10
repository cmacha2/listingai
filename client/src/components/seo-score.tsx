import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, XCircle, TrendingUp } from "lucide-react";

interface SEOScoreProps {
  title: string;
  description: string;
  productName: string;
  categories: string[] | string; // Support both array and single category for backward compatibility
  price: string;
}

interface SEOCheck {
  name: string;
  passed: boolean;
  score: number;
  recommendation?: string;
}

export default function SEOScore({ title, description, productName, categories, price }: SEOScoreProps) {
  const seoAnalysis = useMemo(() => {
    // Normalize categories to always be an array
    const categoryArray = Array.isArray(categories) ? categories : [categories];
    const categoryText = categoryArray.join(' ').toLowerCase();
    
    const checks: SEOCheck[] = [
      {
        name: "Title Length",
        passed: title.length > 0 && title.length <= 80,
        score: title.length > 0 && title.length <= 80 ? 20 : title.length > 80 ? 10 : 0,
        recommendation: title.length > 80 ? "Title is too long for eBay (max 80 chars)" : title.length === 0 ? "Add a title" : undefined
      },
      {
        name: "Brand/Product Name",
        passed: title.toLowerCase().includes(productName.toLowerCase().split(' ')[0]),
        score: title.toLowerCase().includes(productName.toLowerCase().split(' ')[0]) ? 15 : 0,
        recommendation: !title.toLowerCase().includes(productName.toLowerCase().split(' ')[0]) ? "Include product/brand name in title" : undefined
      },
      {
        name: "Category Keywords",
        passed: categoryArray.some(cat => 
          title.toLowerCase().includes(cat.toLowerCase()) || 
          description.toLowerCase().includes(cat.toLowerCase())
        ),
        score: categoryArray.some(cat => 
          title.toLowerCase().includes(cat.toLowerCase()) || 
          description.toLowerCase().includes(cat.toLowerCase())
        ) ? 15 : 0,
        recommendation: !categoryArray.some(cat => 
          title.toLowerCase().includes(cat.toLowerCase()) || 
          description.toLowerCase().includes(cat.toLowerCase())
        ) ? `Include category keywords: ${categoryArray.join(', ')}` : undefined
      },
      {
        name: "Description Length",
        passed: description.length >= 100,
        score: description.length >= 200 ? 20 : description.length >= 100 ? 15 : description.length >= 50 ? 10 : 0,
        recommendation: description.length < 100 ? "Add more detailed description (recommended 200+ characters)" : undefined
      },
      {
        name: "Price Mention",
        passed: description.toLowerCase().includes('price') || description.toLowerCase().includes('$') || description.toLowerCase().includes('value') || description.toLowerCase().includes('deal'),
        score: description.toLowerCase().includes('price') || description.toLowerCase().includes('$') || description.toLowerCase().includes('value') || description.toLowerCase().includes('deal') ? 10 : 0,
        recommendation: !(description.toLowerCase().includes('price') || description.toLowerCase().includes('$') || description.toLowerCase().includes('value') || description.toLowerCase().includes('deal')) ? "Mention value proposition or pricing benefits" : undefined
      },
      {
        name: "Action Words",
        passed: /\b(buy|get|shop|order|purchase|grab|limited|exclusive|new|best|premium|quality)\b/i.test(title + ' ' + description),
        score: /\b(buy|get|shop|order|purchase|grab|limited|exclusive|new|best|premium|quality)\b/i.test(title + ' ' + description) ? 10 : 0,
        recommendation: !/\b(buy|get|shop|order|purchase|grab|limited|exclusive|new|best|premium|quality)\b/i.test(title + ' ' + description) ? "Add action words like 'premium', 'best', 'limited', etc." : undefined
      },
      {
        name: "Shipping/Returns Info",
        passed: /\b(shipping|delivery|returns|warranty|guarantee|fast|free)\b/i.test(description),
        score: /\b(shipping|delivery|returns|warranty|guarantee|fast|free)\b/i.test(description) ? 10 : 0,
        recommendation: !/\b(shipping|delivery|returns|warranty|guarantee|fast|free)\b/i.test(description) ? "Mention shipping or return policies" : undefined
      }
    ];

    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);
    const recommendations = checks.filter(check => !check.passed && check.recommendation).map(check => check.recommendation!);

    return {
      checks,
      totalScore,
      recommendations,
      grade: totalScore >= 80 ? 'A' : totalScore >= 60 ? 'B' : totalScore >= 40 ? 'C' : 'D'
    };
  }, [title, description, productName, categories, price]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return "bg-green-100 text-green-800";
    if (grade === 'B') return "bg-yellow-100 text-yellow-800";
    if (grade === 'C') return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
            SEO Score
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getGradeColor(seoAnalysis.grade)}>
              Grade {seoAnalysis.grade}
            </Badge>
            <span className={`text-2xl font-bold ${getScoreColor(seoAnalysis.totalScore)}`}>
              {seoAnalysis.totalScore}/100
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall SEO Score</span>
            <span>{seoAnalysis.totalScore}/100</span>
          </div>
          <Progress value={seoAnalysis.totalScore} className="h-2" />
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Analysis Details</h4>
          {seoAnalysis.checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {check.passed ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                )}
                <span className="text-sm font-medium">{check.name}</span>
              </div>
              <span className="text-sm text-gray-600">{check.score} pts</span>
            </div>
          ))}
        </div>

        {seoAnalysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center">
              <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {seoAnalysis.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-600 pl-6">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {seoAnalysis.totalScore >= 80 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <h4 className="font-medium text-green-900">Excellent SEO!</h4>
                <p className="text-sm text-green-700">
                  Your listing is optimized for maximum visibility on eBay.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}