// Project: UI MATRIX
// Category: components
// Source: design-systems\UI MATRIX\src\components
// Lines: 89

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Lightbulb, XCircle } from "lucide-react";

interface GuideStep {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: GuideStep[] = [
  {
    number: 1,
    title: "Выберите головной инструмент",
    description: "Определите инструмент, который задаст тон вашему проекту.",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  },
  {
    number: 2,
    title: "Изучите совместимость",
    description: "Смотрите столбец совместимости для выбора подходящих инструментов.",
    icon: <AlertCircle className="h-5 w-5 text-sky-500" />,
  },
  {
    number: 3,
    title: "Добавьте стилизацию",
    description: "Headless-библиотеки требуют CSS-инструмент и иконки.",
    icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
  },
  {
    number: 4,
    title: "Избегайте конфликтов",
    description: "Не смешивайте крупные стилизованные библиотеки.",
    icon: <XCircle className="h-5 w-5 text-red-500" />,
  },
];

export function UsageGuide() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Как пользоваться матрицей</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => (
            <div key={step.number} className="p-3 rounded-lg bg-muted/50 space-y-1.5">
              <div className="flex items-center gap-1.5">
                {step.icon}
                <h4 className="font-medium text-sm">{step.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t space-y-2">
          <h4 className="font-medium text-sm">Обозначения совместимости:</h4>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span className="text-sm">Отлично</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-sky-500" />
              <span className="text-sm">Хорошо</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span className="text-sm">Осторожно</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-sm">Избегать</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
