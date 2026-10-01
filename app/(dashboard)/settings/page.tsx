import * as React from "react";
import {
  Building2,
  Snowflake,
  ShieldCheck,
  Save,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export const metadata = {
  title: "Settings | HPS SEA FOODS",
};

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border">
        <div>
          <h1 className="text-base font-bold tracking-tight text-foreground">
            Settings & Business Profile
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage your company details, alerts, and preferences
          </p>
        </div>

        <Button size="sm" className="gap-1.5 h-8 text-xs">
          <Save className="h-3.5 w-3.5" /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company & Harbor Facility Details */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <CardTitle>Company & Harbor Facility</CardTitle>
            </div>
            <CardDescription>
              Primary billing identity and main processing plant details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Legal Company Name</label>
              <Input defaultValue="HPS SEA FOODS Pvt Ltd" className="h-8.5 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tax / GST Number</label>
                <Input defaultValue="37AABCH1234F1Z9" className="h-8.5 text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Export License (MPEDA/FDA)</label>
                <Input defaultValue="EXP-IND-2026-8941" className="h-8.5 text-xs font-mono" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Primary Harbor Dock Location</label>
              <Input defaultValue="Berth #2, Visakhapatnam Fishing Harbour, Andhra Pradesh" className="h-8.5 text-xs" />
            </div>
          </CardContent>
        </Card>

        {/* Cold Chain & Temperature Alert Settings */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-primary" />
              <CardTitle>Cold Storage Telemetry Thresholds</CardTitle>
            </div>
            <CardDescription>
              Sensor trigger thresholds for temperature alarms and defrost cycles
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Blast Freezer Target (°C)</label>
                <Input type="number" defaultValue="-35" className="h-8.5 text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Holding Cold Room Target (°C)</label>
                <Input type="number" defaultValue="-25" className="h-8.5 text-xs font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Critical Alarm Threshold (°C)</label>
                <Input type="number" defaultValue="-18" className="h-8.5 text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Weighbridge Unit</label>
                <Select defaultValue="KG" className="h-8.5 text-xs">
                  <option value="KG">Kilograms (kg)</option>
                  <option value="MT">Metric Tons (MT)</option>
                  <option value="LBS">Pounds (lbs)</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial & Invoicing Defaults */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <CardTitle>Financial & Ledger Defaults</CardTitle>
            </div>
            <CardDescription>
              Base accounting currency and default invoice payment terms
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Base Currency</label>
                <Select defaultValue="INR" className="h-8.5 text-xs">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="AED">AED (د.إ)</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Default Credit Terms</label>
                <Select defaultValue="15" className="h-8.5 text-xs">
                  <option value="0">Due on Delivery (COD)</option>
                  <option value="7">Net 7 Days</option>
                  <option value="15">Net 15 Days</option>
                  <option value="30">Net 30 Days</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Roles */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <CardTitle>Security & Access Control</CardTitle>
            </div>
            <CardDescription>
              Supabase Auth policies and role permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div className="text-xs text-muted-foreground leading-normal">
              Role-Based Access Control (RBAC) is enforced across all operational endpoints:
            </div>
            <div className="flex flex-wrap gap-2 text-xs pt-1">
              <span className="rounded-md border border-primary/20 bg-primary/10 text-primary px-2 py-0.5 font-mono text-[10px] font-semibold">ADMIN</span>
              <span className="rounded-md border border-border bg-muted text-muted-foreground px-2 py-0.5 font-mono text-[10px]">MANAGER</span>
              <span className="rounded-md border border-border bg-muted text-muted-foreground px-2 py-0.5 font-mono text-[10px]">ACCOUNTANT</span>
              <span className="rounded-md border border-border bg-muted text-muted-foreground px-2 py-0.5 font-mono text-[10px]">STAFF</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
