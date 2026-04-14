import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";

export interface TestCaseFormValues {
  title: string;
}

export const EMPTY_TEST_CASE_FORM: TestCaseFormValues = {
  title: "",
};

interface TestCaseFromProps {
  specId: string;
  open: boolean;
  openChange?: (open: boolean) => void;
}

const TestCaseFrom = ({ specId, open, openChange }: TestCaseFromProps) => {
  const [values, setValues] =
    useState<TestCaseFormValues>(EMPTY_TEST_CASE_FORM);

  function set<K extends keyof TestCaseFormValues>(
    field: K,
    value: TestCaseFormValues[K]
  ) {
    setValues({ ...values, [field]: value });
  }
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spec-title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="spec-title"
              placeholder="ej. Autenticación con JWT"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestCaseFrom;
