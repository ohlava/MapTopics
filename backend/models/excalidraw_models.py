from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple, Union
from pydantic import BaseModel, Field, ConfigDict


# --- Small helper models used by elements ---

class BoundElement(BaseModel):
    # e.g. { "type": "text", "id": "..." }
    type: str
    id: str


class ArrowBinding(BaseModel):
    # e.g. { elementId, focus, gap, fixedPoint? }
    elementId: str
    focus: Optional[float] = None
    gap: Optional[float] = None
    fixedPoint: Optional[Tuple[float, float]] = None


class Element(BaseModel):
    """
    Base Excalidraw element with all common properties.

    Extra fields are allowed to ensure perfect round-trip of unknown/new attributes.
    """

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    # Identity and positioning
    id: str
    type: str
    x: float
    y: float
    width: float
    height: float
    angle: float = 0

    # Styling
    strokeColor: Optional[str] = None
    backgroundColor: Optional[str] = None
    fillStyle: Optional[str] = None  # solid, cross-hatch, etc.
    strokeWidth: Optional[float] = None
    strokeStyle: Optional[str] = None  # solid, dashed, dotted
    roughness: Optional[int] = None
    opacity: Optional[int] = None  # 0..100

    # Grouping and frames
    groupIds: List[str] = Field(default_factory=list)
    frameId: Optional[str] = None

    # Rounding / corner radius
    # In Excalidraw this can be {"type": 3} or a numeric value depending on type
    roundness: Optional[Union[int, Dict[str, Any]]] = None

    # Versioning / lifecycle
    seed: Optional[int] = None
    version: Optional[int] = None
    versionNonce: Optional[int] = None
    isDeleted: Optional[bool] = None
    updated: Optional[int] = None  # epoch ms

    # Linking & metadata
    boundElements: Optional[List[BoundElement]] = None
    link: Optional[str] = None
    locked: Optional[bool] = None

    # Z-order / scene index (string in new Excalidraw serialized format)
    index: Optional[str] = None


class Node(Element):
    """
    Node represents non-arrow elements in the scene (rectangles, diamonds, ellipses, text, images, etc.).
    It inherits all common Element properties and adds text-related ones used by text/container elements.
    """

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    # Text-related (only present for text elements or container texts)
    text: Optional[str] = None
    fontSize: Optional[float] = None
    fontFamily: Optional[int] = None
    textAlign: Optional[str] = None  # left | center | right
    verticalAlign: Optional[str] = None  # top | middle | bottom
    containerId: Optional[str] = None  # id of the containing element
    originalText: Optional[str] = None
    autoResize: Optional[bool] = None
    lineHeight: Optional[float] = None


class Edge(Element):
    """
    Edge represents connections (arrows/lines) between elements.
    Includes points and optional bindings to start/end elements.
    """

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    # Geometry of the polyline making the edge
    points: List[Tuple[float, float]] = Field(default_factory=list)

    # Bindings to elements (for arrows)
    startBinding: Optional[ArrowBinding] = None
    endBinding: Optional[ArrowBinding] = None

    # Arrowheads
    startArrowhead: Optional[str] = None  # arrow | bar | dot | triangle | none
    endArrowhead: Optional[str] = None

    # Routing and layout
    elbowed: Optional[bool] = None
    fixedSegments: Optional[Any] = None
    lastCommittedPoint: Optional[Any] = None
    startIsSpecial: Optional[bool] = None
    endIsSpecial: Optional[bool] = None


class ExcalidrawDocument(BaseModel):
    """
    A full Excalidraw scene/document.

    - elements: list of elements (Nodes and Edges). We keep them as Element to allow unknown/new types.
    - metadata: dict holding appState, files, version, source, type, and any other top-level keys so
      we can reconstruct the original JSON without loss.
    """

    model_config = ConfigDict(extra="allow")

    elements: List[Element] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @property
    def nodes(self) -> List[Node]:
        """Return elements that are considered nodes (i.e., non-arrow types) coerced as Node."""
        result: List[Node] = []
        for el in self.elements:
            if el.type != "arrow":
                result.append(Node(**el.model_dump()))
        return result

    @property
    def edges(self) -> List[Edge]:
        """Return elements that are connections (type == 'arrow') coerced as Edge."""
        result: List[Edge] = []
        for el in self.elements:
            if el.type == "arrow":
                result.append(Edge(**el.model_dump()))
        return result

    @classmethod
    def from_raw_scene(cls, data: Union[Dict[str, Any], List[Dict[str, Any]]]) -> "ExcalidrawDocument":
        """
        Build a document from either:
        - a full Excalidraw export dict with keys: elements, appState, files, etc.
        - a bare list of elements
        """
        if isinstance(data, list):
            elements = [Element(**e) for e in data]
            metadata: Dict[str, Any] = {}
            return cls(elements=elements, metadata=metadata)

        # dict case
        raw = dict(data)  # shallow copy
        raw_elements = raw.pop("elements", [])
        elements = [Element(**e) for e in raw_elements]
        # Everything else is stored as metadata
        metadata = raw
        return cls(elements=elements, metadata=metadata)

    def to_raw_scene(self) -> Dict[str, Any]:
        """Reconstruct a full Excalidraw JSON payload (dict) from this document."""
        out: Dict[str, Any] = {**self.metadata}
        out["elements"] = [e.model_dump(exclude_none=True) for e in self.elements]
        return out
