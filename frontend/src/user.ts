type Project = {
  id: string;
  name: string;
  description?: string;
  endDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
};

function renderProjects(projects: Project[]): void {
  const container = document.getElementById("projectsGrid")!;
  container.innerHTML = "";

  if (projects.length === 0) {
    container.innerHTML = "<p>No assigned projects yet.</p>";
    return;
  }

  projects.forEach((project) => {
    const card = document.createElement("div");
    card.className = "project-card";

    card.innerHTML = `
      <h3>${project.name}</h3>
      <p><strong>Status:</strong> ${formatStatus(project.status)}</p>
      <p><strong>Ends:</strong> ${new Date(project.endDate).toLocaleDateString()}</p>
      <p><strong>Created:</strong> ${new Date(project.createdAt).toLocaleDateString()}</p>
      ${project.description ? `<p>${project.description}</p>` : ""}
    `;

    container.appendChild(card);
  });
}

function formatStatus(status: string): string {
  return status.replace("_", " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
}

async function fetchUserProjects(): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "auth.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/user/projects", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch");

    const projects: Project[] = await res.json();
    renderProjects(projects);
  } catch (error) {
    console.error(error);
    document.getElementById("projectsGrid")!.innerHTML = "<p>Error loading projects</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".sidebar-nav a");
  const sections = document.querySelectorAll(".dashboard-section");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      navLinks.forEach((lnk) => lnk.classList.remove("active"));

      link.classList.add("active");

      const targetId = link.getAttribute("data-section");

      sections.forEach((section) => section.classList.remove("active"));

      const targetSection = document.getElementById(targetId!);
      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });
});
