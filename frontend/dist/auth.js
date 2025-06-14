"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-forms form');
    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            tabButtons.forEach((button) => button.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            if (!tab)
                return;
            forms.forEach((form) => {
                if (form.id === `${tab}Form`) {
                    form.classList.add('active');
                }
                else {
                    form.classList.remove('active');
                }
            });
        });
    });
});
