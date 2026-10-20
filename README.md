# Amirreza Saadi — Dev Portfolio

## Structure

```
portfolio-amirreza-saadi/
├── main.go              # Go server: HTML + /api/* (health, projects, skills, contact)
├── go.mod
├── templates/index.html  # portfolio page (Go templates)
├── static/css/style.css   # dev-theme: matrix bg, terminals, glitch, glass cards
├── static/js/main.js      # matrix rain, typing, tilt, playground terminal, API ping
├── Dockerfile
└── README.md
```

## Run

```bash
cd ~/Desktop/portfolio-amirreza-saadi
go run .
# → http://localhost:8080
```

Custom port:

```bash
PORT=3000 go run .
```

Build binary:

```bash
go build -o portfolio . && ./portfolio
```

Docker:

```bash
docker build -t portfolio .
docker run -p 8080:8080 portfolio
```

## API

| Route | Method | Description |
|---|---|---|
| `/` | GET | portfolio page |
| `/api/health` | GET | `{status, uptime, go, time}` — live proof the Go server runs |
| `/api/projects` | GET | project list as JSON |
| `/api/skills` | GET | skills as JSON |
| `/api/contact` | POST | `{name,email,message}` → logged server-side |

## Features

- Boot-sequence preloader, matrix-rain canvas, cursor glow, grid overlay
- Glitch name, typed roles (`Backend Developer / Golang Engineer / …`), live fake shell
- Animated skill bars, counters, tilt cards, scroll reveal
- Real Go template data
- Interactive playground terminal: try `help`, `whoami`, `skills`, `go version`
- Contact form POSTs to Go backend; server uptime shown in hero + footer
- Fully responsive + mobile menu

## Contact

- Email: amirrezasaadi0509@gmail.com
- GitHub: https://github.com/AmirrezaSaadi
- Location: Tabriz, East Azerbaijan, Iran
