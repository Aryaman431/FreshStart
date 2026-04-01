"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Check, X, HelpCircle, Loader2 } from 'lucide-react';
import { refineSectionContent, RefineSectionContentOutput } from '@/ai/flows/ai-refine-section-content';
import { detectGapsAndSuggestImprovements, DetectGapsAndSuggestImprovementsOutput } from '@/ai/flows/ai-detect-gaps-and-suggest-improvements';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AIReviewProps {
  sectionName: string;
  content: string;
  onAccept: (refinedContent: string) => void;
}

export function AIReview({ sectionName, content, onAccept }: AIReviewProps) {
  const [loading, setLoading] = useState(false);
  const [refinement, setRefinement] = useState<RefineSectionContentOutput | null>(null);
  const [gaps, setGaps] = useState<DetectGapsAndSuggestImprovementsOutput | null>(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (refinement || gaps || error) {
      setRefinement(null);
      setGaps(null);
      setError('');
    }
  }, [content]);

  const handleAIAction = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      const [refinementRes, gapsRes] = await Promise.all([
        refineSectionContent({ sectionName, sectionContent: content }),
        detectGapsAndSuggestImprovements({ sectionName, sectionContent: content })
      ]);
      setRefinement(refinementRes);
      setGaps(gapsRes);
    } catch (error) {
      console.error("AI Error:", error);
      setError((error as Error)?.message || 'AI assist failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-2">
      {!refinement && !loading && (
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleAIAction}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold border-none transition-all duration-300 shadow-md opacity-100"
          disabled={!content.trim()}
        >
          <Sparkles className="w-4 h-4 mr-2 text-white" />
          AI Assist: Refine & Detect Gaps
        </Button>
      )}

      {loading && (
        <div className="flex items-center justify-center p-4 space-x-2 text-sm text-muted-foreground animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>AI is analyzing your content...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTitle className="text-red-800 text-sm">AI Assist Error</AlertTitle>
          <AlertDescription className="text-red-700 text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {refinement && (
        <Card className="p-4 border-accent/30 bg-accent/5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold flex items-center text-accent-foreground">
              <Sparkles className="w-4 h-4 mr-2 text-accent" />
              AI Refined Suggestion
            </h4>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setRefinement(null)}>
                <X className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => { onAccept(refinement.refinedContent); setRefinement(null); }}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm italic mb-3 text-foreground/80 leading-relaxed whitespace-pre-wrap">"{refinement.refinedContent}"</p>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Improvements:</p>
            <ul className="text-xs space-y-1">
              {refinement.improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-accent mr-1">•</span> {imp}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {gaps?.hasGaps && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <HelpCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 text-sm">Gaps Detected</AlertTitle>
          <AlertDescription className="text-amber-700 text-xs">
            <div className="mt-1 space-y-2">
              {gaps.followUpQuestions.map((q, idx) => (
                <p key={idx} className="font-medium italic">"{q}"</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
