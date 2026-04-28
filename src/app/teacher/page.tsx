
'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { summarizeCommonMisconceptions } from '@/ai/flows/summarize-common-misconceptions';
import { Users, AlertTriangle, Lightbulb, TrendingUp, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock student response data for the dashboard
const MOCK_RESPONSES: Record<string, string[]> = {
  'Cell Biology': [
    "The mitochondria is just a decoration in the cell.",
    "Ribosomes make energy for the cell.",
    "Cells are only found in humans, not plants.",
    "The nucleus is what digests food in the cell.",
    "I'm not sure, maybe the cell wall is the powerhouse?"
  ],
  'Geometry': [
    "Angles in a triangle always add up to 360.",
    "A triangle has 4 sides if it is big enough.",
    "Only right triangles have 180 degrees.",
    "Sum of angles is 100 degrees."
  ]
};

export default function TeacherPage() {
  const [activeTopic, setActiveTopic] = useState('Cell Biology');
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async (topic: string) => {
    setLoading(true);
    try {
      const result = await summarizeCommonMisconceptions({
        topic,
        studentResponses: MOCK_RESPONSES[topic]
      });
      setInsights(result);
    } catch (error) {
      console.error("Failed to fetch teacher insights", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights(activeTopic);
  }, [activeTopic]);

  return (
    <div className="min-h-screen pb-20 md:pt-20 bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto p-4 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
              <Users className="text-primary" /> Teacher Dashboard
            </h1>
            <p className="text-muted-foreground">Monitor class performance and address common misconceptions.</p>
          </div>
          <Button variant="outline" onClick={() => fetchInsights(activeTopic)} disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Insights
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 this week</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Avg. Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">Steady since last month</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Struggling Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">2</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="Cell Biology" className="w-full" onValueChange={setActiveTopic}>
          <div className="flex items-center justify-between mb-4">
             <TabsList>
               <TabsTrigger value="Cell Biology">Cell Biology</TabsTrigger>
               <TabsTrigger value="Geometry">Geometry</TabsTrigger>
             </TabsList>
          </div>

          <TabsContent value={activeTopic} className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">AI is analyzing student responses...</p>
              </div>
            ) : insights ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="text-orange-500" />
                        Common Misconceptions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {insights.commonMisconceptions.map((m: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg text-sm border border-red-100">
                            <span className="font-bold text-red-600 mt-0.5">{i+1}.</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="text-primary" />
                        Pattern Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {insights.summaryExplanation}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-accent bg-accent/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-accent-foreground">
                        <Sparkles className="text-accent" />
                        AI Teaching Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {insights.suggestedTeachingPoints.map((point: string, i: number) => (
                        <div key={i} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-accent/20">
                          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-relaxed">{point}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Select a topic to view AI insights.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
