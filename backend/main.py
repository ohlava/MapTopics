from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Union
from pydantic import BaseModel
import asyncio
import math
from models.excalidraw_models import ExcalidrawDocument
from graph.networkx_adapter import excalidraw_to_networkx
import io
import base64

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

# Pydantic models for API responses
class Source(BaseModel):
    title: str
    url: str
    favicon: Optional[str] = None

class ExploreCard(BaseModel):
    id: int
    topic: str
    description: str
    sources: List[Source]

class ExploreResponse(BaseModel):
    cards: List[ExploreCard]
    has_more: bool
    total_count: int

# Mock data for explore cards - in production this would come from a database
MOCK_TOPICS = [
    "Quantum Computing", "Machine Learning", "Climate Change", "Blockchain Technology",
    "Artificial Intelligence", "Space Exploration", "Renewable Energy", "Biotechnology",
    "Virtual Reality", "Cybersecurity", "Neural Networks", "Gene Editing",
    "Sustainable Agriculture", "Ocean Conservation", "Robotics", "Nanotechnology",
    "Solar Energy", "Electric Vehicles", "Digital Privacy", "Cryptocurrency",
    "Augmented Reality", "3D Printing", "Smart Cities", "Internet of Things",
    "Cloud Computing", "Big Data Analytics", "Autonomous Vehicles", "Telemedicine",
    "Green Technology", "Quantum Physics", "Bioinformatics", "Environmental Science",
    "Space Technology", "Renewable Resources", "Data Science", "Computer Vision",
    "Natural Language Processing", "Edge Computing", "Microbiome Research", "Clean Energy",
    "Precision Medicine", "Smart Agriculture", "Digital Transformation", "Ecosystem Restoration",
    "Sustainable Development", "Advanced Materials", "Bioengineering", "Quantum Sensors",
    "Carbon Capture", "Marine Biology", "Atmospheric Science", "Sustainable Transportation"
]

def generate_mock_description(topic: str) -> str:
    """Generate a realistic description for a topic"""
    descriptions = [
        f"{topic} represents a groundbreaking field that is revolutionizing how we understand and interact with the world around us. This comprehensive exploration delves into the fundamental principles, cutting-edge research, and practical applications that define this fascinating domain. represents a groundbreaking field that is revolutionizing how we understand and interact with the world around us. This comprehensive exploration delves into the fundamental principles, cutting-edge research, and practical applications that define this fascinating domain.",
        f"Exploring {topic} reveals a complex landscape of innovation and discovery. From theoretical foundations to real-world implementations, this field continues to push the boundaries of human knowledge and technological capability.",
        f"The study of {topic} encompasses a wide range of interdisciplinary approaches and methodologies. This topic explores the intersection of science, technology, and society, highlighting key developments and future possibilities.",
        f"{topic} is at the forefront of modern scientific and technological advancement. This exploration examines current trends, breakthrough discoveries, and the potential impact on various industries and aspects of daily life.",
        f"Understanding {topic} requires a deep dive into both historical context and contemporary developments. This comprehensive overview covers essential concepts, recent innovations, and emerging challenges in this dynamic field."
    ]
    import random
    return random.choice(descriptions)

def generate_mock_sources(topic: str) -> List[Source]:
    """Generate realistic sources for a topic"""
    sources_pool = [
        Source(title="Wikipedia", url="https://wikipedia.org", favicon="https://wikipedia.org/static/favicon/wikipedia.ico"),
        Source(title="Nature Journal", url="https://nature.com", favicon=None),
        Source(title="MIT Technology Review", url="https://technologyreview.com", favicon=None),
        Source(title="Scientific American", url="https://scientificamerican.com", favicon=None),
        Source(title="IEEE Spectrum", url="https://spectrum.ieee.org", favicon=None),
        Source(title="Research Paper Archive", url="https://arxiv.org", favicon=None),
        Source(title="Google Scholar", url="https://scholar.google.com", favicon=None),
        Source(title="Academic Database", url="https://example.com", favicon=None),
        Source(title="Science Direct", url="https://sciencedirect.com", favicon=None),
        Source(title="PubMed", url="https://pubmed.ncbi.nlm.nih.gov", favicon=None)
    ]
    import random
    return random.sample(sources_pool, min(random.randint(2, 4), len(sources_pool)))

@app.get("/")
def read_root():
    return {"Hello": "From the MapTopics Backend!"}

@app.get("/api/health")
def health_check():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "ok", "message": "API is healthy"}


# --- Excalidraw scene models ---
@app.post("/api/excalidraw/parse")
def parse_excalidraw_scene(payload: Union[dict, list] = Body(...)):
    """
    Accepts a full Excalidraw export JSON or a list of elements (as seen in localStorage)
    and returns our normalized, lossless document shape.
    """
    doc = ExcalidrawDocument.from_raw_scene(payload)
    return {
        "elementsCount": len(doc.elements),
        "nodes": len(doc.nodes),
        "edges": len(doc.edges),
        "metadataKeys": list(doc.metadata.keys()),
    }


@app.post("/api/excalidraw/echo")
def echo_excalidraw_scene(payload: Union[dict, list] = Body(...)):
    """
    Validates and then re-serializes the scene to prove lossless reconstruction.
    """
    doc = ExcalidrawDocument.from_raw_scene(payload)
    return doc.to_raw_scene()


@app.post("/api/excalidraw/render")
def render_excalidraw_scene(payload: Union[dict, list] = Body(...)):
    """
    Accepts a full Excalidraw export JSON or a list of elements, converts it to a
    NetworkX graph, renders a simple PNG preview and returns it as a data URL.
    """
    doc = ExcalidrawDocument.from_raw_scene(payload)
    G = excalidraw_to_networkx(doc, directed=True, allow_multi=True, include_deleted=False)

    try:
        import matplotlib
        matplotlib.use("Agg")  # non-GUI backend
        import matplotlib.pyplot as plt
        from matplotlib.patches import Circle
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matplotlib is required to render images: {e}")

    # If no nodes, render a friendly placeholder
    if G.number_of_nodes() == 0:
        dpi = 96
        width_px, height_px = 480, 240
        fig_w_in, fig_h_in = width_px / dpi, height_px / dpi

        fig, ax = plt.subplots(figsize=(fig_w_in, fig_h_in), dpi=dpi)
        ax.set_facecolor("white")
        ax.axis("off")
        ax.text(
            0.5,
            0.5,
            "No graph to render",
            ha="center",
            va="center",
            fontsize=14,
            color="#888888",
            transform=ax.transAxes,
        )
        buf = io.BytesIO()
        plt.tight_layout(pad=0)
        fig.savefig(buf, format="png", dpi=dpi, facecolor="white", pad_inches=0)
        plt.close(fig)
        buf.seek(0)
        b64 = base64.b64encode(buf.read()).decode("ascii")
        return {"format": "png", "width": width_px, "height": height_px, "dataUrl": f"data:image/png;base64,{b64}"}

    # Build positions based on element bounding boxes
    pos = {}
    xs, ys = [], []
    for n, data in G.nodes(data=True):
        x = float(data.get("x", 0.0)) + float(data.get("width", 0.0)) / 2.0
        y = float(data.get("y", 0.0)) + float(data.get("height", 0.0)) / 2.0
        pos[n] = (x, y)
        xs.append(x)
        ys.append(y)

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    padding = 40.0
    width_px = max(1.0, (max_x - min_x) + 2 * padding)
    height_px = max(1.0, (max_y - min_y) + 2 * padding)

    dpi = 96
    fig_w_in = max(1.0, width_px / dpi)
    fig_h_in = max(1.0, height_px / dpi)

    fig, ax = plt.subplots(figsize=(fig_w_in, fig_h_in), dpi=dpi)
    ax.set_facecolor("white")
    ax.axis("off")

    ax.set_xlim(min_x - padding, max_x + padding)
    ax.set_ylim(max_y + padding, min_y - padding)

    # Draw edges as straight lines between centers
    edge_color = "#999999"
    for u, v in G.edges():
        x1, y1 = pos[u]
        x2, y2 = pos[v]
        ax.plot([x1, x2], [y1, y2], color=edge_color, linewidth=1.5, alpha=0.9)

    # Draw nodes as circles, size scaled lightly by element size
    for n, data in G.nodes(data=True):
        x, y = pos[n]
        w = float(data.get("width", 40.0))
        h = float(data.get("height", 40.0))
        r = max(6.0, min(w, h) * 0.2)
        fill = data.get("backgroundColor") or "#ffffff"
        stroke = data.get("strokeColor") or "#1e1e1e"
        circle = Circle((x, y), radius=r, facecolor=fill, edgecolor=stroke, linewidth=1.5, alpha=0.95)
        ax.add_patch(circle)
        label = data.get("text")
        if label:
            ax.text(x, y, str(label), ha="center", va="center", fontsize=8, color="#222222")

    # Export to PNG in-memory
    buf = io.BytesIO()
    plt.tight_layout(pad=0)
    fig.savefig(buf, format="png", dpi=dpi, facecolor="white", bbox_inches="tight", pad_inches=0)
    plt.close(fig)
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode("ascii")
    return {"format": "png", "width": int(width_px), "height": int(height_px), "dataUrl": f"data:image/png;base64,{b64}"}

@app.get("/api/explore", response_model=ExploreResponse)
async def get_explore_cards(
    limit: int = Query(default=5, ge=1, le=20, description="Number of cards to return"),
    offset: int = Query(default=0, ge=0, description="Number of cards to skip"),
):
    """
    Get explore cards with pagination support.
    
    - **limit**: Number of cards to return (1-20)
    - **offset**: Number of cards to skip for pagination
    """
    
    # Simulate API delay (remove in production)
    await asyncio.sleep(0.5)
    
    # Calculate total available cards
    total_count = len(MOCK_TOPICS) * 3  # Each topic can appear multiple times with variations
    
    # Check if we have more cards available
    has_more = offset + limit < total_count
    
    # Generate cards for this page
    cards = []
    for i in range(limit):
        card_index = offset + i
        if card_index >= total_count:
            break
            
        # Cycle through topics and add variation
        topic_index = card_index % len(MOCK_TOPICS)
        variation = (card_index // len(MOCK_TOPICS)) + 1
        
        base_topic = MOCK_TOPICS[topic_index]
        topic = base_topic if variation == 1 else f"{base_topic} (Advanced Concepts)"
        
        card = ExploreCard(
            id=card_index + 1,
            topic=topic,
            description=generate_mock_description(topic),
            sources=generate_mock_sources(topic)
        )
        cards.append(card)
    
    return ExploreResponse(
        cards=cards,
        has_more=has_more,
        total_count=total_count
    )

@app.get("/api/explore/count")
async def get_explore_count():
    """Get the total number of available explore cards."""
    return {"total_count": len(MOCK_TOPICS) * 3}
