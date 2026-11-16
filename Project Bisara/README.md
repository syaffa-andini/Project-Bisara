# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Autentikasi BISARA

Halaman masuk dan pendaftaran tersedia di `/login` dan `/register`. Proyek ini belum menyertakan backend autentikasi; formulir mengirim permintaan ke `POST /auth/login` dan `POST /auth/register` pada URL dasar API, yang secara default adalah `/api`.

Untuk memakai backend, atur URL dasarnya di `.env.local`, misalnya:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Login mengirim `email`, `password`, dan `rememberMe`; pendaftaran mengirim `name`, `email`, dan `password`. Backend harus mengembalikan status sukses HTTP saat autentikasi berhasil. Permintaan menggunakan `credentials: 'include'` agar backend dapat mengelola sesi melalui cookie; aplikasi tidak menyimpan password atau token di `localStorage`. Jika kontrak backend berbeda, sesuaikan endpoint dan payload di `src/authService.js`.
