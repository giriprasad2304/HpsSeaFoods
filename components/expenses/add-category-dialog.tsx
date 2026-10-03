"use client";

import * as React from "react";
import { Tag, Loader2, Plus, Sparkles } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExpenseCategoryDTO } from "@/types";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: (category: ExpenseCategoryDTO) => void;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  onCategoryCreated,
}: AddCategoryDialogProps) {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName("");
      setCode("");
      setDescription("");
      setError(null);
    }
  }, [open]);

  // Auto-suggest code when typing name if user hasn't explicitly entered a custom code
  const handleNameChange = (val: string) => {
    setName(val);
    const cleaned = val.trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toUpperCase();
    if (cleaned) {
      setCode(`EXP-CAT-${cleaned}`);
    } else {
      setCode("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a category name");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/expenses/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create category");
      }

      onCategoryCreated(json.data);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Tag className="h-4.5 w-4.5" />
            </div>
            <div>
              <DialogTitle>Add New Expense Category</DialogTitle>
              <DialogDescription>
                Create a custom category for classifying operational expenses.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Category Name <span className="text-destructive">*</span></span>
              <span className="text-[10px] text-muted-foreground font-normal">e.g. Dry Ice, Reefer Truck, Loading</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Export Packing Materials"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoFocus
              className="h-9.5 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Category Code (Optional)</span>
              <span className="text-[10px] text-muted-foreground font-normal flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-primary" /> Auto-generated
              </span>
            </label>
            <Input
              type="text"
              placeholder="e.g. EXP-CAT-EXPP"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="h-9.5 text-xs sm:text-sm font-mono uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Description (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Specialized 10kg & 20kg export thermocol boxes and strapping"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9.5 text-xs sm:text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !name.trim()}
            className="text-xs gap-1.5 font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Create Category
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
