"use strict";
document.addEventListener('DOMContentLoaded', () => {
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
                if (section.id === targetSectionId) {
                    section.classList.add('active');
                }
                else {
                    section.classList.remove('active');
                }
            });
        });
    });
});
