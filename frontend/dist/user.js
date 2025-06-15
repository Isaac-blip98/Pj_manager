"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(() => {
    const role = localStorage.getItem('role');
    if (role !== 'USER') {
        window.location.href = 'auth.html';
    }
})();
function renderProjects(projects) {
    const container = document.getElementById("projectsGrid");
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
        completeBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            markProjectAsCompleted(project.id);
        }));
    }
}
function formatStatus(status) {
    return status.replace("_", " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
}
function fetchUserProjects() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "auth.html";
            return;
        }
        try {
            const res = yield fetch("http://localhost:3000/api/user/projects", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok)
                throw new Error("Failed to fetch");
            const projects = yield res.json();
            renderProjects(projects);
        }
        catch (error) {
            console.error(error);
            document.getElementById("projectsGrid").innerHTML = "<p>Error loading projects</p>";
        }
    });
}
function markProjectAsCompleted(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = localStorage.getItem("token");
        if (!token)
            return;
        try {
            const res = yield fetch(`http://localhost:3000/api/projects/${projectId}/complete`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const err = yield res.json();
                throw new Error(err.message || "Failed to mark as completed");
            }
            alert("Project marked as completed!");
            yield fetchUserProjects();
        }
        catch (err) {
            alert(err.message);
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    fetchUserProjects();
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.dashboard-section');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.dataset.section;
            if (!targetSectionId)
                return;
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(section => {
                section.classList.toggle('active', section.id === targetSectionId);
            });
        });
    });
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn === null || logoutBtn === void 0 ? void 0 : logoutBtn.addEventListener('click', () => {
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
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add("active");
            }
        });
    });
});
