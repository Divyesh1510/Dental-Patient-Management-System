import React from 'react';

const PrintablePrescription = ({ data }) => {
  if (!data) return null;

  const getToothLabel = (type, details) => {
    let label = type;
    if (details.category) label += ` (${details.category})`;
    if (details.teeth && details.teeth.length > 0) label += ` [${details.teeth.join(', ')}]`;
    if (details.grade) label += ` - ${details.grade}`;
    return label;
  };

  const renderClinicalFindings = () => {
    if (!data.clinicalFindings || Object.keys(data.clinicalFindings).length === 0) return null;
    return (
      <ul className="list-disc pl-4 space-y-1 text-sm font-semibold text-black">
        {Object.entries(data.clinicalFindings).map(([type, details], i) => (
          <li key={i}>{getToothLabel(type, details)}</li>
        ))}
      </ul>
    );
  };

  return (
    <div 
      className="font-sans relative m-0 print:p-0 print:overflow-visible w-full h-[297mm] overflow-hidden"
      style={{ backgroundColor: 'white', color: 'black', border: '5px solid red' }}
    >
      {/* Background Image covering the entire A4 page */}
      <img 
        src="/Prescription.jpeg" 
        alt="Prescription Background" 
        className="absolute inset-0 w-full h-full object-fill z-0" 
      />

      <div className="absolute inset-0 flex items-center justify-center z-50">
        <h1 style={{ fontSize: '100px', color: 'black' }}>TEST RENDER</h1>
      </div>
    </div>
  );
};

export default PrintablePrescription;
