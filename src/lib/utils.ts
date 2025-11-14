import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generatePassword = () => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const getStatusVariant = (status: string) => {
  switch (status.toUpperCase()) {
    case "ONGOING":
      return "success";
    case "UPCOMING":
      return "info";
    case "COMPLETED":
      return "outline";
    case "CANCELLED":
      return "destructive";
    case "PENDING":
      return "warning";
    default:
      return "default";
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-800 border-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function timeAgo(date: Date | string) {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  let unit = "second";
  let value = seconds;

  if (seconds < 60) {
    unit = "second";
    value = seconds;
  } else if (seconds < 3600) {
    unit = "minute";
    value = Math.floor(seconds / 60);
  } else if (seconds < 86400) {
    unit = "hour";
    value = Math.floor(seconds / 3600);
  } else if (seconds < 2592000) {
    unit = "day";
    value = Math.floor(seconds / 86400);
  } else if (seconds < 31536000) {
    unit = "month";
    value = Math.floor(seconds / 2592000);
  } else {
    unit = "year";
    value = Math.floor(seconds / 31536000);
  }

  return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
}
