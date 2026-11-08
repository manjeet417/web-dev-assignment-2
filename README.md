# Note App (MERN)

Express + MongoDB backend with JWT auth, and a React (Vite) frontend.

## 1. Backend
```bash
cd backend
npm install
cp .env.example .env     # then edit mongourl and JWT_SECRET
npm run server           # runs on http://localhost:8080
```

## 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:8080
npm run dev              # opens on http://localhost:5173
```

## API
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /user/register | no | name, email, password |
| POST | /user/login | no | returns token and name |
| GET | /home | no | public welcome |
| GET | /dashboard | yes | private welcome |
| GET | /notes?search= | yes | list my notes |
| POST | /notes | yes | create note |
| PATCH | /notes/:id | yes | update note |
| DELETE | /notes/:id | yes | delete note |

Send the token as `Authorization: Bearer <token>`.
