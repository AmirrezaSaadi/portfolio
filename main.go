package main

import (
	"compress/gzip"
	"embed"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"time"
)

//go:embed templates/* static/* static/**/*
var content embed.FS

var startTime = time.Now()

type Skill struct {
	Name    string `json:"name"`
	Level   int    `json:"level"`
	Icon    string `json:"icon"`
	Color   string `json:"color"`
	Command string `json:"command"`
	Sub     string `json:"sub"`
}

type Project struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Lang        string   `json:"lang"`
	LangColor   string   `json:"langColor"`
	Link        string   `json:"link"`
	Stars       string   `json:"stars"`
	Tags        []string `json:"tags"`
	Status      string   `json:"status"`
	Icon        string   `json:"icon"`
	Filter      string   `json:"filter"`
	Date        string   `json:"date"`
}

type Experience struct {
	Role     string   `json:"role"`
	Company  string   `json:"company"`
	Location string   `json:"location"`
	Period   string   `json:"period"`
	Stack    string   `json:"stack"`
	Bullets  []string `json:"bullets"`
}

type Portfolio struct {
	Name       string
	Role       string
	Email      string
	Phone      string
	Location   string
	FullAddr   string
	Github     string
	University string
	GPA        string
	Birth      string
	Marital    string
	Military   string
	Skills     []Skill
	Projects   []Project
	Exp        []Experience
	Year       int
	Uptime     string
	GoVer      string
	AssetV     string
}

func portfolioData() Portfolio {
	return Portfolio{
		Name:       "Amirreza Saadi",
		Role:       "Backend Developer",
		Email:      "amirrezasaadi0509@gmail.com",
		Phone:      "+98 933 014 8482",
		Location:   "Tabriz, Iran",
		FullAddr:   "Khavaran, Tabriz, East Azerbaijan, Iran",
		Github:     "https://github.com/AmirrezaSaadi",
		University: "Shahid Madani University of Azerbaijan",
		GPA:        "16.35",
		Birth:      "2005-07-31 (1384/05/09)",
		Marital:    "Single",
		Military:   "Student exemption",
		Year:       time.Now().Year(),
		GoVer:      "go1.27",
		AssetV:     "6",
		Skills: []Skill{
			{Name: "Golang", Level: 78, Icon: "Go", Color: "#00ADD8", Command: "go version", Sub: "net/http • gRPC • MVC"},
			{Name: "C++", Level: 74, Icon: "C++", Color: "#659AD2", Command: "g++ --version", Sub: "Unix • terminal apps"},
			{Name: "C#", Level: 66, Icon: "C#", Color: "#9B4F96", Command: "dotnet --version", Sub: "ASP.NET MVC • Web API"},
			{Name: "Python", Level: 58, Icon: "Py", Color: "#FFD43B", Command: "python3 --version", Sub: "scripting • tooling"},
			{Name: "PostgreSQL", Level: 77, Icon: "SQL", Color: "#336791", Command: "psql --version", Sub: "tuning • indexing"},
			{Name: "MSSQL", Level: 71, Icon: "MS", Color: "#CC2927", Command: "sqlcmd -?", Sub: "stored procedures"},
			{Name: "Docker", Level: 63, Icon: "⬢", Color: "#2496ED", Command: "docker ps", Sub: "compose • deploy"},
			{Name: "Linux", Level: 68, Icon: ">_", Color: "#FCC624", Command: "uname -a", Sub: "ops • services"},
			{Name: "Kotlin", Level: 57, Icon: "Kt", Color: "#7F52FF", Command: "kotlinc -version", Sub: "Compose • MVVM"},
		},
		Projects: []Project{
			{
				Title:       "lenslocked",
				Description: "Image-sharing web app in Golang (MVC) on PostgreSQL + Docker. bcrypt-hashed auth (signup/login), REST API design, containerized infra. In active development.",
				Lang:        "Go", LangColor: "#00ADD8",
				Link:   "https://github.com/AmirrezaSaadi/lenslocked",
				Stars:  "MVC • REST • bcrypt",
				Tags:   []string{"golang", "postgresql", "docker", "rest-api", "bcrypt", "mvc"},
				Status: "in-progress",
				Icon:   "[IMG]",
				Filter: "backend",
				Date:   "2025 — WIP",
			},
			{
				Title:       "grpc-user-validation",
				Description: "Standalone user auth/validation microservice in Go over gRPC and Protocol Buffers, with a service-oriented layout for fast inter-service calls. Finished as a distributed-systems practice project.",
				Lang:        "Go", LangColor: "#00ADD8",
				Link:   "https://github.com/AmirrezaSaadi/gRPC-user-validation",
				Stars:  "gRPC • protobuf",
				Tags:   []string{"golang", "grpc", "protobuf", "microservice"},
				Status: "shipped",
				Icon:   "[RPC]",
				Filter: "backend",
				Date:   "2025 — done",
			},
			{
				Title:       "nodolist",
				Description: "Lightweight offline Android notes & todos. Kotlin, MVVM, Jetpack Compose, Room/SQLite, Coroutines + StateFlow, instant search, progress bar, Material 3 dynamic dark theme + soft animations.",
				Lang:        "Kotlin", LangColor: "#7F52FF",
				Link:   "https://github.com/AmirrezaSaadi/nodolist",
				Stars:  "MVVM • Compose",
				Tags:   []string{"kotlin", "compose", "room", "mvvm", "material3"},
				Status: "stable",
				Icon:   "[TXT]",
				Filter: "mobile",
				Date:   "2025",
			},
			{
				Title:       "PHASE",
				Description: "Terminal-based text editor for Unix in C++. Team project with classmates — input handling, buffers, terminal raw mode. Planned rewrite in Golang.",
				Lang:        "C++", LangColor: "#f34b7d",
				Link:   "https://github.com/phaseditor/PHASE",
				Stars:  "terminal • unix",
				Tags:   []string{"c++", "terminal", "unix", "editor", "team-project"},
				Status: "active",
				Icon:   "[EDT]",
				Filter: "systems",
				Date:   "2025 — team",
			},
			{
				Title:       "this-website",
				Description: "The very page you are reading. Go net/http, vanilla CSS/JS, zero frameworks — rendering this exact card about itself rendering this exact card. Counts as a shipped project, which is precisely why the counter up there says 4+.",
				Lang:        "Go", LangColor: "#00ADD8",
				Link:   "https://github.com/AmirrezaSaadi",
				Stars:  "meta • recursion",
				Tags:   []string{"golang", "meta", "recursion", "portfolio"},
				Status: "shipped",
				Icon:   "[WEB]",
				Filter: "backend",
				Date:   "2026 — very meta",
			},
		},
		Exp: []Experience{
			{
				Role:     "Full-Stack Intern — Industrial Web Systems",
				Company:  "Motorsazan Tractorsazi Co. (Iran Tractor)",
				Location: "Tabriz, Iran",
				Period:   "Aug 2026 — Oct 2026 · Mordad–Mehr 1405",
				Stack:    "C# • ASP.NET MVC • Web API • MSSQL • DevExpress • JWT • Swagger",
				Bullets: []string{
					"Owned full modules end-to-end (DB → API → UI): designed data model, API layer & pages with clean-code principles.",
					"Shipped guard stations & shift-management module for the site security system.",
					"Designed MSSQL tables + custom stored procedures for dynamic CRUD; enforced data-integrity rules & faster queries.",
					"Built RESTful Web API controllers with custom attributes for model validation, empty-input checks & JWT access control.",
					"Built dynamic DevExpress UI: GridView with filtering, pagination & live row-numbering, service-bound ComboBox with instant search.",
					"Tested every endpoint independently via Swagger; synced client text/date formats with the DB layer & fixed data-mismatch bugs.",
					"Delivered on time under constraints via deep code analysis, internal docs & tight teamwork.",
				},
			},
		},
	}
}

func main() {
	tmpl := template.Must(template.ParseFS(content, "templates/index.html"))

	mux := http.NewServeMux()

	// Static files from embed (long-lived cache: filenames only change on redeploy)
	staticFS := http.FileServer(http.FS(content))
	mux.Handle("/static/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age=86400")
		staticFS.ServeHTTP(w, r)
	}))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		data := portfolioData()
		data.Uptime = time.Since(startTime).Round(time.Second).String()
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		if err := tmpl.Execute(w, data); err != nil {
			http.Error(w, err.Error(), 500)
		}
	})

	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status": "online",
			"uptime": time.Since(startTime).Round(time.Second).String(),
			"go":     "go1.27",
			"server": "net/http",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	mux.HandleFunc("/api/projects", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(portfolioData().Projects)
	})

	mux.HandleFunc("/api/skills", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(portfolioData().Skills)
	})

	mux.HandleFunc("/api/experience", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(portfolioData().Exp)
	})

	mux.HandleFunc("/api/contact", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST only", 405)
			return
		}
		var msg struct {
			Name    string `json:"name"`
			Email   string `json:"email"`
			Message string `json:"message"`
		}
		if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
			http.Error(w, `{"error":"invalid json"}`, 400)
			return
		}
		log.Printf("[CONTACT] from=%s <%s> msg=%.120s", msg.Name, msg.Email, msg.Message)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"ok": true, "message": "Message received. I usually reply within 24h.",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
	log.Printf("\033[32m✓ server running\033[0m → http://localhost%s  (user: amirreza | stack: go + postgres + docker)", addr)
	log.Printf("routes: /  /api/health  /api/projects  /api/skills  /api/experience  /api/contact")
	if err := http.ListenAndServe(addr, withLogging(withGzip(mux))); err != nil {
		log.Fatal(err)
	}
}

// withGzip transparently compresses text responses (html/css/js/json) for
// clients that accept it. Binary payloads (e.g. resume.pdf) pass through.
func withGzip(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") || r.Method == http.MethodHead {
			next.ServeHTTP(w, r)
			return
		}
		rec := httptest.NewRecorder()
		next.ServeHTTP(rec, r)
		body := rec.Body.Bytes()
		ct := rec.Header().Get("Content-Type")
		compressible := strings.HasPrefix(ct, "text/") ||
			strings.Contains(ct, "javascript") || strings.Contains(ct, "json") || strings.Contains(ct, "xml")
		if rec.Code != 200 || !compressible {
			for k, v := range rec.Header() {
				w.Header()[k] = v
			}
			w.WriteHeader(rec.Code)
			w.Write(body)
			return
		}
		for k, v := range rec.Header() {
			if strings.EqualFold(k, "Content-Length") {
				continue
			}
			w.Header()[k] = v
		}
		w.Header().Set("Content-Encoding", "gzip")
		w.WriteHeader(rec.Code)
		gz := gzip.NewWriter(w)
		gz.Write(body)
		gz.Close()
	})
}

func withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(t).Round(time.Microsecond))
	})
}
