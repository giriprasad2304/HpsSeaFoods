import * as React from "react";
import { ThermometerSnowflake, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const rooms = [
  { name: "Blast Freezer Room 1", temp: -35.2, target: -35.0, capacity: 15000, current: 12400, status: "OPTIMAL" },
  { name: "Deep Freeze Hold A", temp: -24.8, target: -25.0, capacity: 40000, current: 31200, status: "OPTIMAL" },
  { name: "Deep Freeze Hold B", temp: -23.9, target: -25.0, capacity: 40000, current: 28900, status: "OPTIMAL" },
  { name: "Chilled Receiving Bay", temp: 2.1, target: 2.0, capacity: 8000, current: 4100, status: "OPTIMAL" },
];

export const ColdStorageStatus = React.memo(function ColdStorageStatus() {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-semibold">Cold Storage & Thermal Telemetry</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Continuous sensor logs across blast freezers and staging bays
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-success font-medium">
            <ShieldCheck className="h-3.5 w-3.5" /> All Compressors Online
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rooms.map((room) => {
            const occupancy = Math.round((room.current / room.capacity) * 100);

            return (
              <div
                key={room.name}
                className="rounded-md border border-border p-3 bg-muted/20 flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-foreground">{room.name}</span>
                  <ThermometerSnowflake className="h-3.5 w-3.5 text-primary shrink-0" />
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold font-mono text-foreground">
                    {room.temp}°C
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    (Target: {room.target}°C)
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Occupancy</span>
                    <span className="font-mono font-medium text-foreground">{occupancy}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono text-right">
                    {room.current.toLocaleString()} / {room.capacity.toLocaleString()} kg
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
