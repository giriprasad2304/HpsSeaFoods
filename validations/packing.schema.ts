import { z } from "zod";

export const packingCalculatorSchema = z.object({
  saleId: z.string().optional().nullable().or(z.literal("")),
  packingType: z.string().min(2, "Packing description/type is required").default("Thermocol Export Packing"),
  thermocolBoxesCount: z
    .number({ invalid_type_error: "Number of boxes must be a number" })
    .int("Number of boxes must be an integer")
    .nonnegative("Number of boxes cannot be negative")
    .default(0),
  costPerBox: z
    .number({ invalid_type_error: "Cost per box must be a number" })
    .nonnegative("Cost per box cannot be negative")
    .default(0),
  iceCost: z
    .number({ invalid_type_error: "Ice cost must be a number" })
    .nonnegative("Ice cost cannot be negative")
    .default(0),
  oxygenCost: z
    .number({ invalid_type_error: "Oxygen cost must be a number" })
    .nonnegative("Oxygen cost cannot be negative")
    .default(0),
  packingMaterialCost: z
    .number({ invalid_type_error: "Packing material cost must be a number" })
    .nonnegative("Packing material cost cannot be negative")
    .default(0),
  labourCost: z
    .number({ invalid_type_error: "Labour cost must be a number" })
    .nonnegative("Labour cost cannot be negative")
    .default(0),
  transportCost: z
    .number({ invalid_type_error: "Transport cost must be a number" })
    .nonnegative("Transport cost cannot be negative")
    .default(0),
  quantityKg: z
    .number({ invalid_type_error: "Quantity in kg must be a number" })
    .positive("Quantity must be greater than 0"),
  notes: z.string().optional().nullable(),
});

export type PackingCalculatorValues = z.infer<typeof packingCalculatorSchema>;
