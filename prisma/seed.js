import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // const passwordHash = "password123";
  // const students = [
  //   "Juan Dela Cruz",
  //   "Maria Santos",
  //   "Jose Rizal",
  //   "Ana Dizon",
  //   "Mark Villanueva",
  //   "Liza Manalo",
  //   "Rico Tan",
  //   "Grace Bautista",
  //   "Carlo Reyes",
  //   "Patricia Lopez",
  // ].map((name, i) => ({
  //   email: `student${i + 1}@gmail.com`,
  //   name,
  //   role: "USER",
  //   userType: "STUDENT",
  //   password: passwordHash,
  //   userId: `S2025-${1000 + i}`,
  //   year: `${(i % 4) + 1}`,
  //   course: ["BSIT", "BSCS", "BSIS"][i % 3],
  //   section: ["A", "B", "C"][i % 3],
  // }));
  // const faculty = [
  //   "Dr. Roberto Cruz",
  //   "Prof. Maria Villarin",
  //   "Engr. Josephine Lim",
  //   "Sir Carlo Mendoza",
  //   "Ma’am Katrina Ramos",
  //   "Prof. Aldrin Reyes",
  //   "Engr. Rowena Santos",
  //   "Dr. Anton Dela Vega",
  //   "Prof. Michelle Torres",
  //   "Sir Daniel Bautista",
  // ].map((name, i) => ({
  //   email: `faculty${i + 1}@gmail.com`,
  //   name,
  //   role: "USER",
  //   userType: "FACULTY",
  //   password: passwordHash,
  //   userId: `F2025-${1000 + i}`,
  //   institute: "IMACS",
  //   department: ["Computer Studies", "Information Technology", "Mathematics"][
  //     i % 3
  //   ],
  //   position: ["Instructor I", "Instructor II", "Professor I"][i % 3],
  // }));
  // const staff = [
  //   "Allan Perez",
  //   "Bea Domingo",
  //   "Catherine Javier",
  //   "Dennis Gutierrez",
  //   "Elaine Cabrera",
  //   "Francis Rivera",
  //   "Gina Soriano",
  //   "Henry Morales",
  //   "Ivy Fernandez",
  //   "Jason Cruz",
  // ].map((name, i) => ({
  //   email: `staff${i + 1}@gmail.com`,
  //   name,
  //   role: "USER",
  //   userType: "NON_TEACHING",
  //   password: passwordHash,
  //   userId: `NT2025-${1000 + i}`,
  //   unit: ["Registrar", "Accounting", "Library", "HR"][i % 4],
  // }));
  // await prisma.user.createMany({
  //   data: [...students, ...faculty, ...staff],
  //   skipDuplicates: true,
  // });
  // console.log("✅ Seeded 30 users successfully!");
  // const parties = [
  //   {
  //     name: "Bayanihan Party",
  //     description: "Promoting community cooperation",
  //     logoUrl: "",
  //   },
  //   {
  //     name: "Kabataan Party",
  //     description: "Youth-focused initiatives",
  //     logoUrl: "",
  //   },
  //   {
  //     name: "Lingkod Party",
  //     description: "Public service advocacy",
  //     logoUrl: "",
  //   },
  //   { name: "Tulong Party", description: "Aid and volunteerism", logoUrl: "" },
  //   {
  //     name: "Kultura Party",
  //     description: "Arts and culture support",
  //     logoUrl: "",
  //   },
  //   {
  //     name: "Inobasyon Party",
  //     description: "Innovation and tech",
  //     logoUrl: "",
  //   },
  //   {
  //     name: "Kalusugan Party",
  //     description: "Health and wellness",
  //     logoUrl: "",
  //   },
  //   {
  //     name: "Edukasyon Party",
  //     description: "Education reform and programs",
  //     logoUrl: "",
  //   },
  //   { name: "Kapwa Party", description: "Community engagement", logoUrl: "" },
  //   {
  //     name: "Pag-asa Party",
  //     description: "Hope for a better future",
  //     logoUrl: "",
  //   },
  // ];
  // await prisma.party.createMany({
  //   data: parties,
  //   skipDuplicates: true,
  // });
  // console.log("✅ Seeded 10 parties successfully!");
  // const partyApplications = [
  //   // Student Applications
  //   {
  //     userId: "982b6525-6c45-4232-9a8f-c44eb610f6e0", // Juan Dela Cruz
  //     partyId: "3cf8876f-34c7-4a60-9412-e85f006da693", // Bayanihan Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-10T08:30:00Z"),
  //     updatedAt: new Date("2025-11-10T10:15:00Z"),
  //   },
  //   {
  //     userId: "50101077-26de-4e4c-93c0-05dcf322874a", // Maria Santos
  //     partyId: "2e87bc0f-51b5-4e61-9944-1af667937ff5", // Kabataan Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-09T14:20:00Z"),
  //     updatedAt: new Date("2025-11-09T16:45:00Z"),
  //   },
  //   {
  //     userId: "26682003-027b-452a-aaf8-e34752b17703", // Jose Rizal
  //     partyId: "43fb217b-48a2-4881-8321-626322d6d57b", // Edukasyon Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-08T09:10:00Z"),
  //     updatedAt: new Date("2025-11-08T11:30:00Z"),
  //   },
  //   {
  //     userId: "53e10c0f-734f-41a3-ac10-c4f56d5a7d89", // Ana Dizon
  //     partyId: "d94dc646-c613-40b8-8b4d-af7a904fc400", // Inobasyon Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-11T13:25:00Z"),
  //     updatedAt: new Date("2025-11-11T13:25:00Z"),
  //   },
  //   {
  //     userId: "3061c337-1370-48c8-8b06-613f32912c5e", // Mark Villanueva
  //     partyId: "2e87bc0f-51b5-4e61-9944-1af667937ff5", // Kabataan Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-10T11:00:00Z"),
  //     updatedAt: new Date("2025-11-10T15:20:00Z"),
  //   },
  //   {
  //     userId: "a3bebdd4-1f69-4d86-a2d0-0ce137b986a4", // Liza Manalo
  //     partyId: "c0b9437d-aee2-4196-bea4-b3a97a8f019f", // Kultura Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-09T10:30:00Z"),
  //     updatedAt: new Date("2025-11-09T14:00:00Z"),
  //   },
  //   {
  //     userId: "4bf13d21-046a-4ea5-93de-cc46c4729b50", // Rico Tan
  //     partyId: "d94dc646-c613-40b8-8b4d-af7a904fc400", // Inobasyon Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-07T15:45:00Z"),
  //     updatedAt: new Date("2025-11-08T09:20:00Z"),
  //   },
  //   {
  //     userId: "c8bc9ad3-4906-4a1f-8c18-5c492822e799", // Grace Bautista
  //     partyId: "6a6887a2-bc17-4d2f-9994-b5aa51de4dd1", // Kalusugan Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-10T07:15:00Z"),
  //     updatedAt: new Date("2025-11-10T12:30:00Z"),
  //   },
  //   {
  //     userId: "eb07850a-87b6-4c46-9345-2becac71fe33", // Carlo Reyes
  //     partyId: "3bfd8ef2-6971-44ca-b526-711da92d6dad", // Kapwa Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-12T08:00:00Z"),
  //     updatedAt: new Date("2025-11-12T08:00:00Z"),
  //   },
  //   {
  //     userId: "59b14540-486b-4b89-9df5-8d2132f7a89a", // Patricia Lopez
  //     partyId: "d0d69cf2-0b90-42a2-bc52-749b970c7ea4", // Pag-asa Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-09T16:30:00Z"),
  //     updatedAt: new Date("2025-11-10T08:45:00Z"),
  //   },
  //   // Faculty Applications
  //   {
  //     userId: "a148da40-6825-4738-8146-988ae36e78a6", // Dr. Roberto Cruz
  //     partyId: "43fb217b-48a2-4881-8321-626322d6d57b", // Edukasyon Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-08T10:00:00Z"),
  //     updatedAt: new Date("2025-11-08T14:30:00Z"),
  //   },
  //   {
  //     userId: "356b1c8f-7d8b-48ed-8456-77f1b05c2c15", // Prof. Maria Villarin
  //     partyId: "d94dc646-c613-40b8-8b4d-af7a904fc400", // Inobasyon Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-09T09:20:00Z"),
  //     updatedAt: new Date("2025-11-09T13:15:00Z"),
  //   },
  //   {
  //     userId: "2ba8965c-3845-45ed-a2ea-8c68bbe9cc9f", // Engr. Josephine Lim
  //     partyId: "43fb217b-48a2-4881-8321-626322d6d57b", // Edukasyon Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-11T14:00:00Z"),
  //     updatedAt: new Date("2025-11-11T14:00:00Z"),
  //   },
  //   {
  //     userId: "482efd42-765e-4dff-9437-53fdd3b38f81", // Sir Carlo Mendoza
  //     partyId: "d94dc646-c613-40b8-8b4d-af7a904fc400", // Inobasyon Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-10T12:30:00Z"),
  //     updatedAt: new Date("2025-11-10T16:00:00Z"),
  //   },
  //   {
  //     userId: "8a4c093b-86fa-4cae-93b9-ff892f0bf6fc", // Ma'am Katrina Ramos
  //     partyId: "2e87bc0f-51b5-4e61-9944-1af667937ff5", // Kabataan Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-09T11:45:00Z"),
  //     updatedAt: new Date("2025-11-09T15:30:00Z"),
  //   },
  //   // Student applying to RISE Party
  //   {
  //     userId: "31f65778-5d6c-4c40-8390-044d2e139ab5", // Mherwen Wiel Romero
  //     partyId: "d5489a05-e3ae-41a5-b70c-3cca669ec438", // RISE Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-09T13:00:00Z"),
  //     updatedAt: new Date("2025-11-09T17:20:00Z"),
  //   },
  //   // Additional applications for variety
  //   {
  //     userId: "744aea4f-702f-4b66-a14d-63a6f75f176f", // Engr. Rowena Santos
  //     partyId: "6a6887a2-bc17-4d2f-9994-b5aa51de4dd1", // Kalusugan Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-12T09:30:00Z"),
  //     updatedAt: new Date("2025-11-12T09:30:00Z"),
  //   },
  //   {
  //     userId: "fc41bb3e-70d1-47f5-be3e-9c036db55afc", // Dr. Anton Dela Vega
  //     partyId: "1640b2bc-4b8b-41c1-af35-d58ab8cb3bba", // Tulong Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-10T10:15:00Z"),
  //     updatedAt: new Date("2025-11-10T14:45:00Z"),
  //   },
  //   {
  //     userId: "0230d7c3-d83e-4662-a8bf-1074fce83f74", // Sir Daniel Bautista
  //     partyId: "ada1a3cc-7b65-4d36-a1e1-e1c48bdbed99", // Lingkod Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-08T15:20:00Z"),
  //     updatedAt: new Date("2025-11-09T10:00:00Z"),
  //   },
  //   {
  //     userId: "d4003da7-b5d3-4c80-9378-fdfc2247e199", // Prof. Michelle Torres
  //     partyId: "c0b9437d-aee2-4196-bea4-b3a97a8f019f", // Kultura Party
  //     status: "APPROVED",
  //     createdAt: new Date("2025-11-07T12:00:00Z"),
  //     updatedAt: new Date("2025-11-08T08:30:00Z"),
  //   },
  // ];
  // await prisma.partyApplication.createMany({
  //   data: partyApplications,
  //   skipDuplicates: true,
  // });
  // console.log("✅ Seeded 20 party applications successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
