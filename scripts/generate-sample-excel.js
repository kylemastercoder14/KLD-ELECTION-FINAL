import XLSX from "xlsx";

// Sample data with at least 5 users covering different userTypes
const sampleData = [
  // Student users
  {
    email: "john.doe@kld.edu.ph",
    userId: "2024-001",
    name: "John Doe",
    role: "USER",
    userType: "STUDENT",
    status: "Approved",
    year: "3",
    course: "BS Computer Science",
    section: "A",
    institute: "",
    department: "",
    position: "",
    unit: "",
  },
  {
    email: "jane.smith@kld.edu.ph",
    userId: "2024-002",
    name: "Jane Smith",
    role: "USER",
    userType: "STUDENT",
    status: "Approved",
    year: "2",
    course: "BS Information Technology",
    section: "B",
    institute: "",
    department: "",
    position: "",
    unit: "",
  },
  // Faculty users
  {
    email: "prof.williams@kld.edu.ph",
    userId: "FAC-001",
    name: "Prof. Michael Williams",
    role: "FACULTY",
    userType: "FACULTY",
    status: "Approved",
    year: "",
    course: "",
    section: "",
    institute: "Institute of Technology",
    department: "Computer Science",
    position: "Professor II",
    unit: "",
  },
  {
    email: "dr.johnson@kld.edu.ph",
    userId: "FAC-002",
    name: "Dr. Sarah Johnson",
    role: "COMELEC",
    userType: "FACULTY",
    status: "Approved",
    year: "",
    course: "",
    section: "",
    institute: "Institute of Technology",
    department: "Information Technology",
    position: "Associate Professor",
    unit: "",
  },
  // Non-teaching staff
  {
    email: "admin.brown@kld.edu.ph",
    userId: "NT-001",
    name: "Robert Brown",
    role: "ADMIN",
    userType: "NON_TEACHING",
    status: "Approved",
    year: "",
    course: "",
    section: "",
    institute: "",
    department: "",
    position: "",
    unit: "Administrative Services",
  },
  // Additional examples
  {
    email: "maria.garcia@kld.edu.ph",
    userId: "2024-003",
    name: "Maria Garcia",
    role: "USER",
    userType: "STUDENT",
    status: "Approved",
    year: "4",
    course: "BS Business Administration",
    section: "C",
    institute: "",
    department: "",
    position: "",
    unit: "",
  },
  {
    email: "poll.watcher@kld.edu.ph",
    userId: "PW-001",
    name: "David Lee",
    role: "POLL_WATCHER",
    userType: "FACULTY",
    status: "Approved",
    year: "",
    course: "",
    section: "",
    institute: "Institute of Education",
    department: "Political Science",
    position: "Assistant Professor",
    unit: "",
  },
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert data to worksheet
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

// Write the file
const outputPath = "./sample-users-template.xlsx";
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Sample Excel file created: ${outputPath}`);
console.log(`📊 Total users: ${sampleData.length}`);
console.log("\n📋 Column headers:");
console.log(Object.keys(sampleData[0]).join(", "));
console.log("\n💡 Note: All users have default password: password123");
