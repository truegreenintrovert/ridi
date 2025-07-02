
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

function ViewPatientDialog({ patient, open, onClose }) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <h4 className="font-medium text-muted-foreground">Name</h4>
            <p className="mt-1">{patient.name}</p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground">Email</h4>
            <p className="mt-1">{patient.email || "-"}</p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground">Mobile</h4>
            <p className="mt-1">{patient.mobile || "-"}</p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground">Gender</h4>
            <p className="mt-1">{patient.gender || "-"}</p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground">Blood Group</h4>
            <p className="mt-1">{patient.blood_group || "-"}</p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground">Birth Date</h4>
            <p className="mt-1">
              {patient.birth_date
                ? format(new Date(patient.birth_date), "MMM dd, yyyy")
                : "-"}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground">Emergency Contact</h4>
            <p className="mt-1">{patient.emergency_contact || "-"}</p>
          </div>
          <div>
            <h4 className="font-medium text-muted-foreground">Created At</h4>
            <p className="mt-1">
              {patient.created_at
                ? format(new Date(patient.created_at), "MMM dd, yyyy")
                : "-"}
            </p>
          </div>
          <div className="col-span-2">
            <h4 className="font-medium text-muted-foreground">Address</h4>
            <p className="mt-1">{patient.address || "-"}</p>
          </div>
          <div className="col-span-2">
            <h4 className="font-medium text-muted-foreground">Medical History</h4>
            <p className="mt-1">{patient.medical_history || "-"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewPatientDialog;
