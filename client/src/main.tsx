import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Get the root element
const rootElement = document.getElementById("root");

// Set title
document.title = "SchoolSync - School Information Management System";

// Set SEO meta description
const metaDescription = document.createElement("meta");
metaDescription.name = "description";
metaDescription.content = "A comprehensive school information management system for managing students, teachers, classes, attendance, and grades.";
document.head.appendChild(metaDescription);

// Add Open Graph tags for better social media sharing
const ogTitle = document.createElement("meta");
ogTitle.property = "og:title";
ogTitle.content = "SchoolSync - School Information Management System";
document.head.appendChild(ogTitle);

const ogDescription = document.createElement("meta");
ogDescription.property = "og:description";
ogDescription.content = "A comprehensive school information management system for managing students, teachers, classes, attendance, and grades.";
document.head.appendChild(ogDescription);

const ogType = document.createElement("meta");
ogType.property = "og:type";
ogType.content = "website";
document.head.appendChild(ogType);

// Render the app
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found");
}
