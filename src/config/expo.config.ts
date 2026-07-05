import type { ExpoConfig } from './types'

/**
 * ✏️  EDIT THIS FILE to make the expo yours.
 *
 * ARTWORKS
 *   - Put your images in /public/art/ and reference them as `image: 'art/my-piece.jpg'`.
 *   - Sizes are in metres — a 120 × 90 cm canvas is `width: 1.2, height: 0.9`.
 *   - `wall` + `offset` place a painting; offset is from the wall centre, positive to the right.
 *   - Leave `procedural` on any work without a real image yet.
 *
 * ROOM
 *   - `width` / `depth` / `height` control the interior dimensions in metres.
 *   - Set `partition: null` to remove the central dividing wall.
 *
 * TOUR
 *   - Artworks appear in the guided tour in the order listed here.
 *   - `tourDwell` is the seconds the camera lingers at each piece.
 */
export const expo: ExpoConfig = {
  title: 'Open Walls',
  subtitle: 'A virtual exhibition',
  artist: {
    name: 'Your Name',
    bio: 'Replace this with your artist statement. Two or three sentences about your practice, materials and what this body of work explores.',
    website: 'https://example.com',
    contact: 'hello@example.com',
  },

  room: {
    width: 24,
    depth: 16,
    height: 4.4,
    partition: { length: 8, thickness: 0.3, height: 3.4 },
    wallColor: '#f1eee8',
    floorColor: '#8f8a83',
    ceilingColor: '#e9e6e0',
    floorGloss: 0.55,
  },

  spawn: { position: [0, 6.4], heading: 0 },
  eyeHeight: 1.62,
  tourDwell: 9,

  frameDefaults: {
    color: '#1b1a19',
    width: 0.045,
    depth: 0.05,
    mat: 0.08,
    metalness: 0.1,
    roughness: 0.55,
  },

  artworks: [
    // ── Centre partition, facing the entrance ───────────────────────────
    {
      id: 'anchor',
      title: 'Anchor Piece',
      artist: 'Your Name',
      year: '2026',
      medium: 'Oil on linen',
      dimensions: '160 × 110 cm',
      description: 'The first piece visitors meet. Replace with your own work by adding an `image` path.',
      price: 'Available — on request',
      wall: 'center-south',
      offset: 0,
      width: 1.6,
      height: 1.1,
      procedural: { style: 'color-field', seed: 11, palette: ['#b2452e', '#e7b26a', '#2f4a5c', '#efe3cf'] },
    },

    // ── North wall ───────────────────────────────────────────────────────
    {
      id: 'north-left',
      title: 'North Left',
      artist: 'Your Name',
      year: '2025',
      medium: 'Acrylic on panel',
      dimensions: '120 × 120 cm',
      description: 'Describe this work here.',
      wall: 'north',
      offset: -7,
      width: 1.2,
      height: 1.2,
      procedural: { style: 'bauhaus', seed: 3 },
    },
    {
      id: 'north-centre',
      title: 'North Centre',
      artist: 'Your Name',
      year: '2026',
      medium: 'Ink and graphite on paper',
      dimensions: '200 × 100 cm',
      description: 'Describe this work here.',
      wall: 'north',
      offset: 0,
      width: 2.0,
      height: 1.0,
      procedural: { style: 'flow', seed: 27, palette: ['#f3efe6', '#1d2b3a', '#3e6a80', '#c9a35a'] },
      frame: { color: '#d9d4ca', mat: 0.1 },
    },
    {
      id: 'north-right',
      title: 'North Right',
      artist: 'Your Name',
      year: '2024',
      medium: 'Gouache on paper',
      dimensions: '70 × 90 cm',
      description: 'Describe this work here.',
      wall: 'north',
      offset: 7,
      width: 0.7,
      height: 0.9,
      procedural: { style: 'orbits', seed: 8 },
      frame: { color: '#b08b57', metalness: 0.7, roughness: 0.35, width: 0.035 },
    },

    // ── West wall ────────────────────────────────────────────────────────
    {
      id: 'west-centre',
      title: 'West Centre',
      artist: 'Your Name',
      year: '2026',
      medium: 'Oil on canvas',
      dimensions: '240 × 140 cm',
      description: 'A wide, quiet piece. Best seen from the bench.',
      price: 'Sold',
      wall: 'west',
      offset: 0,
      width: 2.4,
      height: 1.4,
      procedural: { style: 'horizon', seed: 41 },
      frame: { mat: 0 },
    },

    // ── East wall ────────────────────────────────────────────────────────
    {
      id: 'east-left',
      title: 'East Left',
      artist: 'Your Name',
      year: '2025',
      medium: 'Pencil and wash on canvas',
      dimensions: '150 × 150 cm',
      description: 'Describe this work here.',
      wall: 'east',
      offset: -3.2,
      width: 1.5,
      height: 1.5,
      procedural: { style: 'grid', seed: 5 },
      frame: { color: '#efece6', mat: 0 },
    },
    {
      id: 'east-right',
      title: 'East Right',
      artist: 'Your Name',
      year: '2026',
      medium: 'Mixed media',
      dimensions: '90 × 130 cm',
      description: 'Describe this work here.',
      wall: 'east',
      offset: 3.2,
      width: 0.9,
      height: 1.3,
      procedural: { style: 'strata', seed: 19 },
    },

    // ── Centre partition, back face ─────────────────────────────────────
    {
      id: 'back-centre',
      title: 'Back Centre',
      artist: 'Your Name',
      year: '2026',
      medium: 'Oil on linen',
      dimensions: '140 × 100 cm',
      description: 'Describe this work here.',
      wall: 'center-north',
      offset: 0,
      width: 1.4,
      height: 1.0,
      procedural: { style: 'color-field', seed: 77, palette: ['#141b2b', '#2c3d5e', '#6c5a7d', '#c9b48f'] },
    },

    // ── South wall ───────────────────────────────────────────────────────
    {
      id: 'south-left',
      title: 'South Left',
      artist: 'Your Name',
      year: '2023',
      medium: 'Screenprint, edition of 20',
      dimensions: '80 × 100 cm',
      description: 'Describe this work here.',
      price: '€ 650 — 4 of 20 left',
      wall: 'south',
      offset: -7,
      width: 0.8,
      height: 1.0,
      procedural: { style: 'bauhaus', seed: 91, palette: ['#e7dfcf', '#d2582c', '#264b5d', '#e3b23c', '#1d1d1b'] },
    },
    {
      id: 'south-right',
      title: 'South Right',
      artist: 'Your Name',
      year: '2025',
      medium: 'Ink on paper',
      dimensions: '100 × 70 cm',
      description: 'Describe this work here.',
      wall: 'south',
      offset: 7,
      width: 1.0,
      height: 0.7,
      procedural: { style: 'flow', seed: 64, palette: ['#efe6d6', '#5a3b22', '#9a6a3e', '#2d2a26'] },
    },

    // ── Sculptures ───────────────────────────────────────────────────────
    {
      id: 'sculpture-1',
      type: 'sculpture',
      title: 'Form Study I',
      artist: 'Your Name',
      year: '2026',
      medium: 'Polished bronze',
      dimensions: '60 × 60 × 45 cm',
      description: 'Replace this placeholder with your own .glb model by adding a `model` path.',
      position: [-7, 3.2],
      shape: 'knot',
      material: { color: '#b7885a', metalness: 1, roughness: 0.22 },
      plinth: { width: 0.75, height: 0.95 },
    },
    {
      id: 'sculpture-2',
      type: 'sculpture',
      title: 'Standing Stone',
      artist: 'Your Name',
      year: '2025',
      medium: 'Cast concrete',
      dimensions: '40 × 25 × 110 cm',
      description: 'A heavy, quiet form that marks the far end of the room.',
      position: [5.2, -4.6],
      shape: 'monolith',
      material: { color: '#9d9890', metalness: 0, roughness: 0.9 },
      plinth: { width: 0.7, height: 0.35 },
    },
  ],

  benches: [
    { position: [-7.3, 0], rotation: 90, length: 2.2 },
    { position: [8.4, 0], rotation: 90, length: 1.8 },
  ],
}
