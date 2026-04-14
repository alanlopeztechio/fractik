'use client";';
import { TestTube2 } from "lucide-react";
import React from "react";

const TestCasesSection = () => {
  return (
    <section>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <TestTube2 className="h-4 w-4" />
          Test Cases {}
        </h3>
      </div>
    </section>
  );
};
export default TestCasesSection;
