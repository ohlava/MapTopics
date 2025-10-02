// Local mind map library utilities (scaffold)
// Provides helpers for naming, indexing, and recent items.

const LIB_INDEX_KEY = 'mindmaps:index';
const RECENT_KEY = 'mindmaps:recent';

// Generate a local unique ID for custom maps
const makeId = () => `mm_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

const makeSlug = (title = '') =>
  title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'untitled';

export const mindmapLibrary = {
  // Ensure index exists
  _init() {
    if (!localStorage.getItem(LIB_INDEX_KEY)) {
      localStorage.setItem(LIB_INDEX_KEY, JSON.stringify([]));
    }
  },

  // List all custom maps in the index
  list() {
    try {
      this._init();
      const raw = localStorage.getItem(LIB_INDEX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Add or update an entry (metadata only)
  upsert(entry) {
    this._init();
    const list = this.list();
    const idx = list.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...entry };
    } else {
      const withMeta = {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...entry,
      };
      list.unshift(withMeta);
    }
    localStorage.setItem(LIB_INDEX_KEY, JSON.stringify(list));
    return list[0];
  },

  getById(id) {
    try {
      const list = this.list();
      return list.find((e) => e.id === id) || null;
    } catch {
      return null;
    }
  },

  // Create a new custom map from scene
  createFromScene({ title = 'Untitled', elements = [], appState = {}, originTopic = null }) {
    const id = makeId();
    const createdAt = Date.now();
    const slug = makeSlug(title);
    const entry = { id, title, slug, originTopic, createdAt, updatedAt: createdAt, isDirty: false };
    const scene = {
      elements,
      appState: { ...appState },
      title,
      originTopic,
      timestamp: new Date(createdAt).toISOString(),
    };
    // Save scene
    const storageKey = this.storageKeyFor({ id });
    localStorage.setItem(storageKey, JSON.stringify(scene));
    // Upsert metadata
    const saved = this.upsert(entry);
    // Add to recents
    this.addRecent({ key: `custom:${id}`, kind: 'custom', id, title, slug });
    return saved;
  },

  // Rename an existing custom map (title + slug)
  rename(id, newTitle) {
    const entry = this.getById(id);
    if (!entry) return null;
    const updated = { ...entry, title: newTitle, slug: makeSlug(newTitle), updatedAt: Date.now() };
    const list = this.list();
    const idx = list.findIndex((e) => e.id === id);
    if (idx >= 0) {
      list[idx] = updated;
      localStorage.setItem(LIB_INDEX_KEY, JSON.stringify(list));
    }
    // Update stored scene's title for consistency
    try {
      const storageKey = this.storageKeyFor({ id });
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const scene = JSON.parse(raw);
        scene.title = newTitle;
        localStorage.setItem(storageKey, JSON.stringify(scene));
      }
    } catch {
      /* ignore metadata update errors */
    }
    return updated;
  },

  // Load/save custom scene
  loadCustomScene(id) {
    try {
      const storageKey = this.storageKeyFor({ id });
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveCustomScene(id, scene, { markDirty = false } = {}) {
    try {
      const storageKey = this.storageKeyFor({ id });
      localStorage.setItem(storageKey, JSON.stringify(scene));
      // update metadata timestamp
      const entry = this.getById(id);
      if (entry) {
        const list = this.list();
        const idx = list.findIndex((e) => e.id === id);
        if (idx >= 0) {
          list[idx] = { ...entry, updatedAt: Date.now(), isDirty: !!markDirty };
          localStorage.setItem(LIB_INDEX_KEY, JSON.stringify(list));
        }
      }
    } catch {
      /* ignore save errors */
    }
  },

  // Track recent maps (topic or custom ids)
  addRecent(item) {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const withoutDup = list.filter((x) => x.key !== item.key);
      const next = [{ ...item, visitedAt: Date.now() }, ...withoutDup].slice(0, 20);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    } catch {
      return [];
    }
  },

  listRecent() {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Resolve storage key for a map (server topic vs custom id)
  storageKeyFor({ topic, id }) {
    if (id) return `mindmap-custom-${id}`;
    // namespacing server keys to avoid any future collision
    return `mindmap-${topic || 'default-canvas'}`;
  },
};

export { makeSlug };
