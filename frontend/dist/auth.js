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
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const errorElement = document.getElementById('loginError');
    if (!emailInput || !passwordInput) {
        console.error('Email or Password input not found in DOM');
        return;
    }
    loginForm === null || loginForm === void 0 ? void 0 : loginForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const payload = {
            email: emailInput.value,
            password: passwordInput.value,
        };
        try {
            const res = yield fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errorData = yield res.json();
                throw new Error(errorData.message || 'Login failed');
            }
            const data = yield res.json();
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('role', data.User.role);
            localStorage.setItem('userId', data.User.id.toString());
            if (data.User.role === 'ADMIN') {
                window.location.href = './admin.html';
            }
            else {
                window.location.href = './user.html';
            }
        }
        catch (error) {
            errorElement.textContent = error.message || 'An error occurred during login';
        }
    }));
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
                form.classList.toggle('active', form.id === `${tab}Form`);
            });
        });
    });
});
