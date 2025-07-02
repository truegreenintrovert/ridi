
import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, Heart, Activity, Weight, Ruler, Thermometer, TrendingUp, ScrollText } from "lucide-react";

export default function HealthRecordHistory({ records }) {
  if (!records || records.length === 0) {
    return (
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Health Record History</CardTitle>
          <CardDescription>View patient's historical health measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ScrollText className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">No health records found</p>
            <p className="text-sm text-muted-foreground">Add a new health record to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>Health Record History</CardTitle>
        <CardDescription>
          Showing {records.length} record{records.length > 1 ? 's' : ''} in chronological order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {records.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(record.recorded_at), "MMM dd, yyyy HH:mm")}
                </span>
              </div>
              {record.bmi && (
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">BMI: {record.bmi}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Heart Rate</p>
                  <p className="text-sm text-muted-foreground">
                    {record.heart_rate || "N/A"} bpm
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Blood Pressure</p>
                  <p className="text-sm text-muted-foreground">
                    {record.blood_pressure_systolic || "N/A"}/
                    {record.blood_pressure_diastolic || "N/A"} mmHg
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Weight className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Weight</p>
                  <p className="text-sm text-muted-foreground">
                    {record.weight || "N/A"} kg
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Ruler className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Height</p>
                  <p className="text-sm text-muted-foreground">
                    {record.height || "N/A"} cm
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Temperature</p>
                  <p className="text-sm text-muted-foreground">
                    {record.temperature || "N/A"} °C
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium">SpO2</p>
                  <p className="text-sm text-muted-foreground">
                    {record.oxygen_saturation || "N/A"}%
                  </p>
                </div>
              </div>
            </div>

            {record.notes && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm font-medium">Notes</p>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{record.notes}</p>
              </div>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
