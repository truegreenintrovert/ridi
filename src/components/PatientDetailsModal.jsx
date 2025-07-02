
import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, User, Heart, Activity, FlaskRound as Flask, Calendar } from 'lucide-react';

export default function PatientDetailsModal({ patient, healthRecords, prescriptions, labTests, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-lg"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-background border-b">
          <h2 className="text-2xl font-bold">Patient Details</h2>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{patient.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="font-medium">{patient.blood_group || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Birth Date</p>
                <p className="font-medium">
                  {patient.birth_date ? format(new Date(patient.birth_date), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <p className="font-medium">{patient.mobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{patient.email || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{patient.address || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Health Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Latest Health Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthRecords.length > 0 ? (
                <div className="space-y-4">
                  {healthRecords.slice(0, 3).map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Heart Rate</p>
                          <p className="font-medium">{record.heart_rate || 'N/A'} bpm</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Blood Pressure</p>
                          <p className="font-medium">
                            {record.blood_pressure_systolic || 'N/A'}/{record.blood_pressure_diastolic || 'N/A'} mmHg
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Temperature</p>
                          <p className="font-medium">{record.temperature || 'N/A'} °C</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Recorded: {format(new Date(record.recorded_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No health records available</p>
              )}
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.slice(0, 3).map((prescription) => (
                    <div key={prescription.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Diagnosis: {prescription.diagnosis}</p>
                          <p className="text-sm text-muted-foreground">
                            Date: {format(new Date(prescription.prescription_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Medicines:</p>
                        <div className="mt-1 space-y-1">
                          {prescription.medicines.map((medicine, index) => (
                            <p key={index} className="text-sm">
                              • {medicine.name} - {medicine.dosage} ({medicine.frequency})
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No prescriptions available</p>
              )}
            </CardContent>
          </Card>

          {/* Lab Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flask className="h-5 w-5" />
                Recent Lab Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {labTests.length > 0 ? (
                <div className="space-y-4">
                  {labTests.slice(0, 3).map((test) => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{test.lab_tests?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Date: {format(new Date(test.test_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            test.status === 'completed' ? 'bg-green-100 text-green-800' :
                            test.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {test.status}
                          </span>
                        </div>
                      </div>
                      {test.report_url && (
                        <div className="mt-2">
                          <a
                            href={test.report_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline inline-flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Report
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No lab tests available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
