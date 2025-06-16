// Initialize admin data
let adminProfile = null;
let users = [];
let projects = [];
const sections = [
    { id: 'overview', title: 'Overview', icon: 'fas fa-chart-pie' },
    { id: 'users', title: 'Users Management', icon: 'fas fa-users' },
    { id: 'projects', title: 'Projects Management', icon: 'fas fa-project-diagram' },
    { id: 'settings', title: 'Settings', icon: 'fas fa-cog' }
];
// Authentication check
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'ADMIN') {
        localStorage.clear();
        window.location.href = 'auth.html';
    }
}
// Fetch admin profile
async function fetchAdminProfile() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
        window.location.href = 'auth.html';
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok)
            throw new Error('Failed to fetch profile');
        const data = await response.json();
        adminProfile = data.data;
        if (!adminProfile) {
            throw new Error('No profile data received');
        }
        // Update UI
        const nameElement = document.getElementById('adminName');
        const emailElement = document.getElementById('adminEmail');
        const userInfoElement = document.querySelector('.user-info');
        if (nameElement && emailElement && userInfoElement) {
            nameElement.textContent = adminProfile.name;
            emailElement.textContent = adminProfile.email;
            // Check if profile image already exists
            let profileImage = userInfoElement.querySelector('.profile-image');
            if (!profileImage) {
                profileImage = document.createElement('img');
                profileImage.className = 'profile-image';
                profileImage.alt = 'Admin profile';
                profileImage.style.cursor = 'pointer';
                userInfoElement.prepend(profileImage);
            }
            profileImage.src = adminProfile.profileImage || './assets/images/default-avatar.png';
        }
    }
    catch (error) {
        console.error('Error fetching admin profile:', error);
    }
}
// Fetch users
async function fetchUsers() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok)
            throw new Error('Failed to fetch users');
        const data = await response.json();
        users = data.data;
        renderUsers();
        updateStats();
    }
    catch (error) {
        console.error('Error fetching users:', error);
    }
}
// Fetch projects
async function fetchProjects() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/projects', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok)
            throw new Error('Failed to fetch projects');
        const data = await response.json();
        projects = data.data;
        renderProjects();
        updateStats();
    }
    catch (error) {
        console.error('Error fetching projects:', error);
    }
}
// Render users table (view only)
function renderUsers() {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody)
        return;
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>
        <div class="user-cell">
          <img src="${user.profileImage || './assets/images/default-avatar.png'}" alt="${user.name}" class="user-avatar">
          ${user.name}
        </div>
      </td>
      <td>${user.email}</td>
      <td><span class="badge ${user.role.toLowerCase()}">${user.role}</span></td>
      <td><span class="badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
      <td>
        <button class="btn btn-small btn-outline" onclick="viewUserProjects('${user.id}')">
          View Projects
        </button>
      </td>
    `;
        tbody.appendChild(tr);
    });
}
// Render projects table with user assignment dropdown
function renderProjects() {
    const tbody = document.querySelector('#projectsTable tbody');
    if (!tbody)
        return;
    tbody.innerHTML = '';
    projects.forEach(project => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${project.name}</td>
      <td>
        <select class="user-assign-select" data-project-id="${project.id}">
          <option value="">Unassigned</option>
          ${users.map(user => `
            <option value="${user.id}" ${project.assignee?.id === user.id ? 'selected' : ''}>
              ${user.name}
            </option>
          `).join('')}
        </select>
      </td>
      <td><span class="badge status-${project.status.toLowerCase()}">${project.status}</span></td>
      <td>${new Date(project.startDate).toLocaleDateString()}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-small btn-outline" onclick="editProject('${project.id}')">
            Edit
          </button>
          <button class="btn btn-small btn-danger" onclick="deleteProject('${project.id}')">
            Delete
          </button>
        </div>
      </td>
    `;
        tbody.appendChild(tr);
        // Add change event listener to the select
        const select = tr.querySelector('.user-assign-select');
        select?.addEventListener('change', (e) => {
            const userId = e.target.value;
            assignProject(project.id, userId);
        });
    });
}
// Update dashboard stats
function updateStats() {
    const totalUsersEl = document.getElementById('totalUsers');
    const totalProjectsEl = document.getElementById('totalProjects');
    const activeProjectsEl = document.getElementById('activeProjects');
    if (totalUsersEl)
        totalUsersEl.textContent = users.length.toString();
    if (totalProjectsEl)
        totalProjectsEl.textContent = projects.length.toString();
    if (activeProjectsEl) {
        activeProjectsEl.textContent = projects.filter(p => p.status === 'IN_PROGRESS').length.toString();
    }
}
// Assign project to user
async function assignProject(projectId, userId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/projects/${projectId}/assign`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userId || null })
        });
        if (!response.ok)
            throw new Error('Failed to assign project');
        await fetchProjects();
        alert(userId ? 'Project assigned successfully' : 'Project unassigned successfully');
    }
    catch (error) {
        console.error('Error assigning project:', error);
        alert('Failed to assign project');
    }
}
// Render navigation
function renderNavigation() {
    const nav = document.querySelector('.sidebar-nav ul');
    if (!nav)
        return;
    nav.innerHTML = sections.map(section => `
    <li>
      <a href="#${section.id}" data-section="${section.id}" class="${section.id === 'overview' ? 'active' : ''}">
        <i class="${section.icon}"></i>
        ${section.title}
      </a>
    </li>
  `).join('');
    // Add event listeners
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
}
// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    const link = e.currentTarget;
    const sectionId = link.dataset.section;
    if (!sectionId)
        return;
    // Update URL
    window.history.pushState({}, '', `#${sectionId}`);
    // Update active state
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    // Show correct section
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    // Fetch data if needed
    switch (sectionId) {
        case 'users':
            fetchUsers();
            break;
        case 'projects':
            fetchProjects();
            break;
        case 'settings':
            loadAdminSettings();
            break;
    }
}
// Load admin settings
async function loadAdminSettings() {
    if (!adminProfile)
        return;
    try {
        // Populate form fields
        const nameInput = document.getElementById('adminFullName');
        const emailInput = document.getElementById('adminEmailInput');
        if (nameInput && emailInput) {
            nameInput.value = adminProfile.name;
            emailInput.value = adminProfile.email;
        }
        // Add form submission handler if not already added
        const form = document.getElementById('adminSettingsForm');
        if (form && !form.dataset.handlerAdded) {
            form.addEventListener('submit', handleSettingsSubmit);
            form.dataset.handlerAdded = 'true';
        }
    }
    catch (error) {
        console.error('Error loading admin settings:', error);
    }
}
// Handle settings form submission
async function handleSettingsSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const nameInput = form.querySelector('#adminFullName');
    const emailInput = form.querySelector('#adminEmailInput');
    const currentPasswordInput = form.querySelector('#currentPassword');
    const newPasswordInput = form.querySelector('#newPassword');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId)
        return;
    const payload = {
        name: nameInput.value,
        email: emailInput.value,
    };
    if (currentPasswordInput.value && newPasswordInput.value) {
        payload.currentPassword = currentPasswordInput.value;
        payload.newPassword = newPasswordInput.value;
    }
    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update settings');
        }
        alert('Settings updated successfully');
        // Clear password fields
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        // Refresh admin profile
        await fetchAdminProfile();
    }
    catch (error) {
        console.error('Error updating settings:', error);
        alert(error instanceof Error ? error.message : 'Failed to update settings');
    }
}
// Handle profile image upload
async function handleProfileImageUpload(file) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const formData = new FormData();
    formData.append('image', file);
    try {
        const response = await fetch(`http://localhost:3000/users/${userId}/profile-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        if (!response.ok)
            throw new Error('Failed to upload image');
        const data = await response.json();
        if (adminProfile && data.data.profileImage) {
            adminProfile.profileImage = data.data.profileImage;
            // Update UI
            const profileImageElement = document.querySelector('.profile-image');
            if (profileImageElement) {
                profileImageElement.src = adminProfile.profileImage || './assets/images/default-avatar.png';
            }
        }
    }
    catch (error) {
        console.error('Error uploading profile image:', error);
        alert('Failed to upload profile image');
    }
}
// Setup profile image upload
function setupProfileImageUpload() {
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none';
    document.body.appendChild(imageInput);
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleProfileImageUpload(file);
        }
    });
    // Add click handler to profile image when it's created
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('profile-image')) {
            imageInput.click();
        }
    });
}
// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    window.location.href = 'auth.html';
}
// Global functions for onclick handlers
window.viewUserProjects = function (userId) {
    const userProjects = projects.filter(p => p.assignee?.id === userId);
    const user = users.find(u => u.id === userId);
    if (user) {
        const projectNames = userProjects.map(p => p.name).join('\n');
        alert(`Projects for ${user.name}:\n${projectNames || 'No projects assigned'}`);
    }
};
window.editProject = function (projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        const newName = prompt('Enter new project name:', project.name);
        if (newName && newName !== project.name) {
            // Add API call to update project name
            console.log('Update project name:', projectId, newName);
        }
    }
};
window.deleteProject = async function (projectId) {
    if (!confirm('Are you sure you want to delete this project?'))
        return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok)
            throw new Error('Failed to delete project');
        await fetchProjects();
        alert('Project deleted successfully');
    }
    catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
    }
};
// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderNavigation();
    fetchAdminProfile();
    fetchUsers();
    fetchProjects();
    setupProfileImageUpload();
    // Add logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    // Load section based on URL hash
    const hash = window.location.hash.slice(1) || 'overview';
    const link = document.querySelector(`[data-section="${hash}"]`);
    if (link) {
        link.click();
    }
    // Setup add project modal
    const addProjectBtn = document.getElementById('addProjectBtn');
    const addProjectModal = document.getElementById('addProjectModal');
    const closeModal = addProjectModal?.querySelector('.close');
    if (addProjectBtn && addProjectModal) {
        addProjectBtn.addEventListener('click', () => {
            addProjectModal.style.display = 'block';
        });
        closeModal?.addEventListener('click', () => {
            addProjectModal.style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target === addProjectModal) {
                addProjectModal.style.display = 'none';
            }
        });
    }
});
export {};
