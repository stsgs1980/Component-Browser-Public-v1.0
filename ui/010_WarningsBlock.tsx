// Project: UI MATRIX
// Category: components
// Source: design-systems\UI MATRIX\src\components
// Lines: 72

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";

const warnings = [
  {
    title: "Headless + Стилизация",
    description: "Headless-библиотеки (Radix UI, Base UI) требуют отдельного решения для стилизации. Tailwind CSS - популярный выбор.",
    type: "info",
  },
  {
    title: "Изолированные экосистемы",
    description: "Ant Design, Mantine, Element Plus - самостоятельные экосистемы. Лучше использовать их изолированно.",
    type: "warning",
  },
  {
    title: "shadcn/ui не npm-пакет",
    description: "shadcn/ui - набор копируемых компонентов. Вы получаете полный контроль над кодом.",
    type: "info",
  },
  {
    title: "Motion = Framer Motion",
    description: "Библиотека Motion - новое название Framer Motion. NPM пакет: framer-motion.",
    type: "info",
  },
];

export function WarningsBlock() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Важные замечания
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`p-3 rounded-md border ${
                warning.type === "warning"
                  ? "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800"
                  : "bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800"
              }`}
            >
              <div className="flex items-start gap-2">
                {warning.type === "warning" ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <Info className="h-4 w-4 text-sky-600 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <h5 className="font-medium text-sm">{warning.title}</h5>
                  <p className="text-xs text-muted-foreground mt-0.5">{warning.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
