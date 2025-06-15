type Project = {
  id: string;
  name: string;
  description?: string;
  endDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
};

(() => {
  const role = localStorage.getItem('role');
  if (role !== 'USER') {
    window.location.href = 'auth.html';
  }

})();
function renderProjects(projects: Project[]): void {
  const container = document.getElementById("projectsGrid")!;
  container.innerHTML = "";

  if (projects.length === 0) {
    container.innerHTML = "<p>No assigned projects yet.</p>";
    return;
  }

  const project = projects[0]; 

  const card = document.createElement("div");
  card.className = "project-card";

  card.innerHTML = `
    <h3>${project.name}</h3>
    <p><strong>Status:</strong> ${formatStatus(project.status)}</p>
    <p><strong>Ends:</strong> ${new Date(project.endDate).toLocaleDateString()}</p>
    <p><strong>Created:</strong> ${new Date(project.createdAt).toLocaleDateString()}</p>
    ${project.description ? `<p>${project.description}</p>` : ""}
    ${project.status !== "COMPLETED" ? `<button id="completeProjectBtn">Mark as Completed</button>` : ""}
  `;

  container.appendChild(card);


  const completeBtn = document.getElementById("completeProjectBtn");
  if (completeBtn) {
    completeBtn.addEventListener("click", async () => {
      markProjectAsCompleted(project.id);
    });
  }
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

async function markProjectAsCompleted(projectId: string): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`http://localhost:3000/api/projects/${projectId}/complete`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to mark as completed");
    }

    alert("Project marked as completed!");
    await fetchUserProjects(); 
  } catch (err: any) {
    alert(err.message);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  fetchUserProjects();

  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.sidebar-nav a');
  const sections = document.querySelectorAll<HTMLElement>('.dashboard-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const targetSectionId = link.dataset.section;
      if (!targetSectionId) return;

      navLinks.forEach(nav => nav.classList.remove('active'));
      link.classList.add('active');

      sections.forEach(section => {
        section.classList.toggle('active', section.id === targetSectionId);
      });
    });
  });

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'auth.html';
  });
});


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

