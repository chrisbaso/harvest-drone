export const growerLeads = [
  {
    id: "GR-1024",
    name: "Hannah Miller",
    farm: "Miller Family Farms",
    state: "Iowa",
    crop: "Corn",
    acres: 1800,
    method: "Ground rig",
    interest: "Yes",
  },
  {
    id: "GR-1025",
    name: "Jose Ramirez",
    farm: "Ramirez Ag",
    state: "Texas",
    crop: "Cotton",
    acres: 2400,
    method: "Aerial + custom application",
    interest: "No",
  },
  {
    id: "GR-1026",
    name: "Claire Benson",
    farm: "Benson Row Crop",
    state: "Arkansas",
    crop: "Soybeans",
    acres: 1350,
    method: "Ground rig",
    interest: "Yes",
  },
];

export const operatorLeads = [
  {
    id: "OP-2041",
    name: "Marcus Lee",
    company: "Lee Precision Ag",
    state: "Missouri",
    ownsDrone: "Yes",
    model: "DJI Agras T40",
    licensed: "Yes",
    radius: "90 miles",
    capacity: 4200,
  },
  {
    id: "OP-2042",
    name: "Tina Park",
    company: "Delta Spray Ops",
    state: "Mississippi",
    ownsDrone: "No",
    model: "Evaluating options",
    licensed: "Yes",
    radius: "60 miles",
    capacity: 2500,
  },
  {
    id: "OP-2043",
    name: "Aaron Schultz",
    company: "Schultz Aero Services",
    state: "Nebraska",
    ownsDrone: "Yes",
    model: "XAG P100 Pro",
    licensed: "No",
    radius: "120 miles",
    capacity: 3800,
  },
];

export function getDashboardStats() {
  const totalGrowerLeads = growerLeads.length;
  const totalOperatorLeads = operatorLeads.length;
  const totalEstimatedAcres = growerLeads.reduce((sum, lead) => sum + lead.acres, 0);
  const statesRepresented = new Set([
    ...growerLeads.map((lead) => lead.state),
    ...operatorLeads.map((lead) => lead.state),
  ]).size;

  return {
    totalGrowerLeads,
    totalOperatorLeads,
    totalEstimatedAcres,
    statesRepresented,
  };
}
