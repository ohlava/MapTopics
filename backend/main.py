from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import asyncio
import math
import json
from pathlib import Path

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


# ---------------- Mind Map initial data API ----------------
class MindMapInitialData(BaseModel):
    topic: str
    elements: list
    appState: dict


def _load_base_elements():
    """Load base Excalidraw elements from local JSON file bundled with the backend."""
    data_path = Path(__file__).parent / "data" / "excalidraw_base.json"
    try:
        with data_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        return [] # empty scene


BASE_ELEMENTS = _load_base_elements()


@app.get("/api/mindmap/{topic}", response_model=MindMapInitialData)
async def get_mindmap_initial_data(topic: str):
    """
    Return initial Excalidraw data for a given mind map topic.

    This simulates server-stored mind maps. For now it's mock up only.
    """
    await asyncio.sleep(0.2)  # simulated latency (remove in production)

    # Start from base and add a topic marker
    elements = list(BASE_ELEMENTS) if isinstance(BASE_ELEMENTS, list) else []

    topic_label = {
        "id": f"topic-label-{abs(hash(topic)) % 10_000_000}",
        "type": "text",
        "x": 600,
        "y": -650,
        "width": 500,
        "height": 60,
        "angle": 0,
        "strokeColor": "#1e1e1e",
        "backgroundColor": "transparent",
        "fillStyle": "solid",
        "strokeWidth": 1,
        "strokeStyle": "solid",
        "roughness": 0,
        "opacity": 100,
        "groupIds": [],
        "frameId": None,
        "index": "a0",
        "roundness": None,
        "seed": 123456,
        "version": 1,
        "versionNonce": 1,
        "isDeleted": False,
        "boundElements": None,
        "updated": 0,
        "link": None,
        "locked": False,
        "text": f"Server init for: {topic}",
        "fontSize": 28,
        "fontFamily": 5,
        "textAlign": "left",
        "verticalAlign": "middle",
        "containerId": None,
        "originalText": f"Server init for: {topic}",
        "autoResize": True,
        "lineHeight": 1.25,
    }

    elements = elements + [topic_label]

    app_state = {
        "viewBackgroundColor": "#ffffff",
        "theme": "light",
    }

    return MindMapInitialData(topic=topic, elements=elements, appState=app_state)
