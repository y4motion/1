# KINETIC DOT-OS: UI SPECIFICATION

## 1. DESIGN PHILOSOPHY
We are moving away from static grids to **"Fluid Kinetic Layouts"**.
* **Reference:** Howard.le motion design, Nothing OS aesthetic.
* **Core Principle:** Elements are "Floating Islands" that react to physics.
* **Physics:** All movements use Spring physics, not linear duration.
    * `transition: { type: "spring", stiffness: 300, damping: 30 }`

## 2. THE GRID SYSTEM (BENTO)
Instead of a fixed CSS Grid, use a **Motion Layout** approach.
* **Smart Resizing:** When a user expands one widget, neighbor widgets must shrink or move out of the way smoothly using `layout` prop from `framer-motion`.
* **Container:** `display: flex; flex-wrap: wrap; gap: 16px;` (Allows natural flow).
* **Islands:** All widgets have `rounded-[32px]`, `border-white/10`, `backdrop-blur-xl`.

## 3. COMPONENT MECHANICS

### A. The Stack (Review Deck)
A mechanism for stacking content to save space.
* **State 1 (Idle):** A stack of 3 cards. Only the top one is fully visible. The back ones are scaled down (0.9, 0.95) and translated Y.
* **State 2 (Hover/Click):** The "Fan". Cards rotate slightly (-5deg, 0deg, 5deg) and spread horizontally.
* **State 3 (Expand):** The stack dissolves, and the container expands to show a list.

### B. The Morphing Card
* **Interaction:** Clicking a small square widget triggers a `layoutId` transition.
* **Effect:** The small square **physically stretches** to become a full-width section or modal. It does not just "pop up". The content inside fades out, and new content fades in *during* the stretch.

### C. The Dot-Matrix Ticker
* **Typography:** Use a monospaced or dot-matrix font for headers.
* **Motion:** Continuous infinite loop (`repeat: Infinity, ease: "linear"`).
* **Interactive:** Pauses on Hover. Scales up slightly (1.02) on Hover.

## 4. VISUAL DIALECT
* **Colors:** Monochrome (Black/White/Grey).
* **Accents:** Only `#FF0000` (Red) dots for "Live/Recording" status.
* **Shapes:** Super-rounded corners (`rounded-3xl`).
* **Lines:** Hairline borders (`1px` solid `white/5`).

---

## 5. FRAMER-MOTION PATTERNS

### A. Spring Presets
```javascript
export const springSmooth = { type: "spring", stiffness: 300, damping: 30 };
export const springBouncy = { type: "spring", stiffness: 400, damping: 20 };
export const springGentle = { type: "spring", stiffness: 200, damping: 40 };
```

### B. Stagger Container
```javascript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: springSmooth
  }
};
```

### C. Layout Animation
```jsx
// Parent container MUST have layout prop
<motion.div layout className="flex flex-wrap gap-4">
  {items.map(item => (
    <motion.div 
      key={item.id}
      layout // This enables smooth reflow
      layoutId={`widget-${item.id}`} // For shared element transitions
    >
      {content}
    </motion.div>
  ))}
</motion.div>
```

### D. Shared Element Transition (Morphing)
```jsx
// Small Card
<motion.div layoutId="expandable-card">
  <SmallContent />
</motion.div>

// Expanded View (shown when expanded)
<AnimatePresence>
  {isExpanded && (
    <motion.div layoutId="expandable-card">
      <ExpandedContent />
    </motion.div>
  )}
</AnimatePresence>
```

---

## 6. COMPOUND STATE MACHINE (The Stack)

```
┌─────────────┐    click    ┌─────────────┐   expand   ┌─────────────┐
│   STACK     │ ──────────> │    FAN      │ ─────────> │    LIST     │
│  (Compact)  │             │  (Preview)  │            │  (Full)     │
└─────────────┘             └─────────────┘            └─────────────┘
       ↑                           │                          │
       │         click outside     │                          │
       └───────────────────────────┴──────────────────────────┘
```

### State Transforms:
```javascript
const cardStates = {
  stack: (index) => ({
    y: index * 8,
    scale: 1 - (index * 0.05),
    rotate: 0,
    x: 0
  }),
  fan: (index) => ({
    y: 0,
    scale: 1,
    rotate: (index - 1) * 8, // -8, 0, 8 degrees
    x: (index - 1) * 120     // spread horizontally
  }),
  list: (index) => ({
    y: index * 140,
    scale: 1,
    rotate: 0,
    x: 0
  })
};
```

---

## 7. IMPLEMENTATION CHECKLIST

### HomePage Requirements:
- [ ] Fluid flex container with `layout` prop
- [ ] Review Deck with 3 states (Stack → Fan → List)
- [ ] Live Ticker with pause-on-hover
- [ ] Active Poll with animated progress
- [ ] Stats Widget with morphing capability
- [ ] Stagger entrance animation on page load

### ModPage Ecosystem Requirements:
- [ ] Smart bento grid that reflows
- [ ] OS Widget with hover-reveal download
- [ ] Lab Slider with drag physics
- [ ] Morphing expand behavior

### Animation Principles:
- [ ] NO linear transitions (always spring)
- [ ] NO instant state changes (always animate)
- [ ] ALL interactive elements have hover/tap feedback
- [ ] Elements "breathe" when idle (subtle scale pulse)
