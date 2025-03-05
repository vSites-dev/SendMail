import { Check } from "lucide-react";
import type { Step } from "@/components/campaigns/modal";
import { cn } from "@/lib/utils";

export function CampaignSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="border-b">
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Badge */}
            <div
              className={`
                flex items-center gap-2 rounded-full px-4 py-1.5
                ${
                  step.isCompleted
                    ? "bg-indigo-600 text-white"
                    : step.isActive
                      ? "border border-indigo-600 bg-indigo-50 text-indigo-600"
                      : "border border-gray-200 bg-gray-50 text-gray-500"
                }
              `}
            >
              {step.isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center",
                    step.isActive ? "text-indigo-600" : "text-gray-500",
                  )}
                >
                  {step.Icon}
                </div>
              )}
              <span className="text-sm font-medium">{step.title}</span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`
                h-0.5 w-12
                ${step.isCompleted ? "bg-indigo-600" : "bg-gray-200"}
              `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
