"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RuleItem {
  title: string;
  content: string;
}

interface RuleSection {
  title: string;
  description: string;
  items: RuleItem[];
}

interface RulesData {
  [key: string]: RuleSection;
}

interface VisualRulesEditorProps {
  initialRules: RulesData;
  onChange: (rules: RulesData) => void;
}

export function VisualRulesEditor({ initialRules, onChange }: VisualRulesEditorProps) {
  const [rules, setRules] = useState<RulesData>(initialRules);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(Object.keys(initialRules))
  );

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const updateSection = (sectionKey: string, field: keyof RuleSection, value: string) => {
    const updatedRules = {
      ...rules,
      [sectionKey]: {
        ...rules[sectionKey],
        [field]: value,
      },
    };
    setRules(updatedRules);
    onChange(updatedRules);
  };

  const addItem = (sectionKey: string) => {
    const updatedRules = {
      ...rules,
      [sectionKey]: {
        ...rules[sectionKey],
        items: [...rules[sectionKey].items, { title: "", content: "" }],
      },
    };
    setRules(updatedRules);
    onChange(updatedRules);
  };

  const removeItem = (sectionKey: string, itemIndex: number) => {
    const updatedRules = {
      ...rules,
      [sectionKey]: {
        ...rules[sectionKey],
        items: rules[sectionKey].items.filter((_, idx) => idx !== itemIndex),
      },
    };
    setRules(updatedRules);
    onChange(updatedRules);
  };

  const updateItem = (sectionKey: string, itemIndex: number, field: keyof RuleItem, value: string) => {
    const updatedItems = [...rules[sectionKey].items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      [field]: value,
    };
    const updatedRules = {
      ...rules,
      [sectionKey]: {
        ...rules[sectionKey],
        items: updatedItems,
      },
    };
    setRules(updatedRules);
    onChange(updatedRules);
  };

  const sectionLabels: { [key: string]: string } = {
    important: "Fontos Információ",
    general: "Általános Szabályzat",
    competition: "Verseny Szabályok",
    league: "Liga Tudnivalók",
    points: "Pontozási Rendszer",
    application: "Jelentkezési Útmutató",
  };

  return (
    <div className="space-y-4">
      {Object.keys(rules).map((sectionKey) => {
        const section = rules[sectionKey];
        const isExpanded = expandedSections.has(sectionKey);

        return (
          <Card key={sectionKey} className="border-border/40 bg-transparent shadow-none">
            <CardHeader 
              className="cursor-pointer hover:bg-muted/20 transition-colors rounded-lg"
              onClick={() => toggleSection(sectionKey)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  {sectionLabels[sectionKey] || sectionKey}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({section.items.length} tétel)
                  </span>
                </CardTitle>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-6 pt-6 px-2">
                {/* Section Title */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Szekció Címe</Label>
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(sectionKey, "title", e.target.value)}
                    className="bg-background/50 border-border/40"
                  />
                </div>

                {/* Section Description */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Leírás</Label>
                  <textarea
                    value={section.description}
                    onChange={(e) => updateSection(sectionKey, "description", e.target.value)}
                    className="flex min-h-[60px] w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm"
                    rows={2}
                  />
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider">Tételek</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addItem(sectionKey)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Tétel Hozzáadása
                    </Button>
                  </div>

                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-4 rounded-lg border border-border/40 bg-muted/10 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-muted-foreground">#{itemIdx + 1}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(sectionKey, itemIdx)}
                          className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Tétel Címe</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => updateItem(sectionKey, itemIdx, "title", e.target.value)}
                          className="bg-background/50 border-border/40"
                          placeholder="pl. Részvétel feltételei"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Tétel Tartalma</Label>
                        <textarea
                          value={item.content}
                          onChange={(e) => updateItem(sectionKey, itemIdx, "content", e.target.value)}
                          className="flex min-h-[80px] w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm"
                          placeholder="A tétel részletes leírása..."
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
