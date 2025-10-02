from __future__ import annotations
from typing import List, Optional
from models import ExcalidrawDocument, Node

def excalidraw_to_networkx(
    doc: ExcalidrawDocument,
    *,
    directed: bool = True,
    allow_multi: bool = True,
    include_deleted: bool = False,
    node_attr_fields: Optional[List[str]] = None,
    edge_attr_fields: Optional[List[str]] = None,
):
    """
    Convert an ExcalidrawDocument into a NetworkX graph.

    - directed: create a directed graph where arrows go from startBinding -> endBinding.
    - allow_multi: use a Multi(Graph/DiGraph) to allow parallel edges between the same nodes.
    - node_attr_fields / edge_attr_fields: optional whitelists of attributes to include on nodes/edges.
    - include_deleted: include elements with isDeleted==True. Otherwise they are skipped.
    """
    try:
        import networkx as nx
    except ImportError as e:
        raise RuntimeError(
            "NetworkX is required for graph operations. Install with: pip install networkx"
        ) from e

    if allow_multi and directed:
        G = nx.MultiDiGraph()
    elif allow_multi and not directed:
        G = nx.MultiGraph()
    elif not allow_multi and directed:
        G = nx.DiGraph()
    else:
        G = nx.Graph()

    if node_attr_fields is None:
        node_attr_fields = [
            "id",
            "type",
            "x",
            "y",
            "width",
            "height",
            "angle",
            "text",
            "fontSize",
            "groupIds",
            "frameId",
            "backgroundColor",
            "strokeColor",
            "opacity",
            "roundness",
        ]

    if edge_attr_fields is None:
        edge_attr_fields = [
            "id",
            "type",
            "points",
            "startArrowhead",
            "endArrowhead",
            "strokeColor",
            "strokeWidth",
            "elbowed",
            "opacity",
        ]

    # Add nodes: all non-arrow elements
    for el in doc.elements:
        if el.type == "arrow":
            continue
        if not include_deleted and getattr(el, "isDeleted", False):
            continue
        n = Node(**el.model_dump())
        attrs_full = n.model_dump(exclude_none=True)
        attrs = {k: v for k, v in attrs_full.items() if k in node_attr_fields}
        attrs["_excalidraw_kind"] = "node"
        G.add_node(n.id, **attrs)

    # Add edges: arrows with both bindings
    for e in doc.edges:
        if not include_deleted and getattr(e, "isDeleted", False):
            continue
        sid = e.startBinding.elementId if e.startBinding else None
        tid = e.endBinding.elementId if e.endBinding else None
        if not sid or not tid:
            continue
        if sid not in G.nodes or tid not in G.nodes:
            continue

        attrs_full = e.model_dump(exclude_none=True)
        attrs = {k: v for k, v in attrs_full.items() if k in edge_attr_fields}
        attrs["_excalidraw_kind"] = "edge"

        if hasattr(G, "add_edge"):
            # Multi-graphs: use edge id as key
            if allow_multi and (G.is_multigraph() if hasattr(G, "is_multigraph") else True):
                G.add_edge(sid, tid, key=e.id, **attrs)
            else:
                # Simple graphs: accumulate weight
                if G.has_edge(sid, tid):
                    current_w = G[sid][tid].get("weight", 1)
                    G[sid][tid]["weight"] = current_w + 1
                else:
                    G.add_edge(sid, tid, weight=1, **attrs)

    G.graph.setdefault("excalidraw", {})
    G.graph["excalidraw"]["elementCount"] = {
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
    }
    return G
