// Project: UI MATRIX
// Category: components
// Source: design-systems\UI MATRIX\src\components
// Lines: 156

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, BookOpen, Info } from "lucide-react";
import { glossaryTerms, type GlossaryTerm } from "@/lib/glossary-data";

interface GlossaryProps {
  compact?: boolean;
}

export function Glossary({ compact = false }: GlossaryProps) {
  const [search, setSearch] = useState("");

  const filteredTerms = search
    ? glossaryTerms.filter(t =>
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase())
      )
    : glossaryTerms;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {glossaryTerms.slice(0, 8).map(term => (
          <TermTooltip key={term.id} term={term} />
        ))}
        {glossaryTerms.length > 8 && (
          <Badge variant="outline" className="text-xs">
            +{glossaryTerms.length - 8} терминов
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="py-2">
      <CardHeader className="pb-1 pt-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Глоссарий терминов
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Поиск терминов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
          {filteredTerms.map(term => (
            <TermTooltip key={term.id} term={term} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Tooltip компонент для термина
export function TermTooltip({ term }: { term: GlossaryTerm }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="text-xs cursor-help hover:bg-muted transition-colors"
          >
            {term.term}
            <Info className="h-3 w-3 ml-1 text-muted-foreground" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium text-sm">{term.term}</p>
          <p className="text-xs text-muted-foreground mt-1">{term.definition}</p>
          {term.examples && term.examples.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs font-medium">Примеры:</p>
              <p className="text-xs text-muted-foreground">{term.examples.join(", ")}</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Компонент для выделения терминов в тексте
export function TermHighlight({ text }: { text: string }) {
  const findTermsInText = (text: string): { text: string; term: GlossaryTerm | null }[] => {
    const result: { text: string; term: GlossaryTerm | null }[] = [];
    let remainingText = text;
    
    const sortedTerms = [...glossaryTerms].sort((a, b) => b.term.length - a.term.length);
    
    while (remainingText.length > 0) {
      let found = false;
      
      for (const term of sortedTerms) {
        const regex = new RegExp(`\\b${term.term}\\b`, 'i');
        const match = remainingText.match(regex);
        
        if (match && match.index !== undefined) {
          if (match.index > 0) {
            result.push({ text: remainingText.slice(0, match.index), term: null });
          }
          result.push({ text: match[0], term });
          remainingText = remainingText.slice(match.index + match[0].length);
          found = true;
          break;
        }
      }
      
      if (!found) {
        result.push({ text: remainingText, term: null });
        break;
      }
    }
    
    return result;
  };

  const parts = findTermsInText(text);

  return (
    <span>
      {parts.map((part, i) => (
        part.term ? (
          <TermTooltip key={i} term={part.term} />
        ) : (
          <span key={i}>{part.text}</span>
        )
      ))}
    </span>
  );
}
