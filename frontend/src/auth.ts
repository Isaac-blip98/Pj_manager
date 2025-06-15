interface LoginResponse {
  access_token: string;
  User: {
    id: number;
    email: string;
    role: 'ADMIN' | 'USER';
    IsActive: boolean;
    CreatedAt: string;
    UpdatedAt: string;
  };
}

interface LoginDto {
  email: string;
  password: string;
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm') as HTMLFormElement;
  const emailInput = document.getElementById('loginEmail') as HTMLInputElement;
  const passwordInput = document.getElementById('loginPassword') as HTMLInputElement;
  const errorElement = document.getElementById('loginError') as HTMLParagraphElement;

  if (!emailInput || !passwordInput) {
  console.error('Email or Password input not found in DOM');
  return;
}

  loginForm?.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const payload: LoginDto = {
      email: emailInput.value,
      password: passwordInput.value,
    };

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData: { message?: string } = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data: LoginResponse = await res.json();

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.User.role);
      localStorage.setItem('userId', data.User.id.toString());

      if (data.User.role === 'ADMIN') {
        window.location.href = './admin.html';
      } else {
        window.location.href = './user.html';
      }
    } catch (error: any) {
      errorElement.textContent = error.message || 'An error occurred during login';
    }
  });

  const tabButtons = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
  const forms = document.querySelectorAll<HTMLFormElement>('.auth-forms form');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((button) => button.classList.remove('active'));
      btn.classList.add('active');

      const tab = btn.dataset.tab;
      if (!tab) return;

      forms.forEach((form) => {
        form.classList.toggle('active', form.id === `${tab}Form`);
      });
    });
  });
});
