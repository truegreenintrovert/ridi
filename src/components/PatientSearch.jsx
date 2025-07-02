
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function PatientSearch({ patients, onSelect, selectedPatient }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredPatients, setFilteredPatients] = React.useState([]);

  React.useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients([]);
      return;
    }

    const filtered = patients.filter((patient) => {
      const nameMatch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const mobileMatch = patient.mobile?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || mobileMatch;
    });

    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by name or mobile number..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchTerm && filteredPatients.length > 0 && (
        <Card className="absolute z-50 w-full mt-1">
          <CardContent className="p-2">
            <div className="max-h-60 overflow-auto">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md ${
                    selectedPatient?.id === patient.id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    onSelect(patient.id);
                    setSearchTerm("");
                  }}
                >
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-sm text-gray-500">
                    {patient.mobile || "No mobile number"}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {searchTerm && filteredPatients.length === 0 && (
        <Card className="absolute z-50 w-full mt-1">
          <CardContent className="p-4 text-center text-gray-500">
            No patients found
          </CardContent>
        </Card>
      )}
    </div>
  );
}
