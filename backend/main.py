from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- CORS (Cross-Origin Resource Sharing) ---
# Allow React frontend to make requests to this backend
origins = [
    "http://localhost:5173", # The default Vite dev server port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)
# --- End of CORS Setup ---


@app.get("/")
def read_root():
    return {"Hello": "From the MapFlow Backend!"}

@app.get("/api/health")
def health_check():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "ok", "message": "API is healthy"}
