# Ghost Protocol - PRD
## Kinetic Dot-OS: Howard.le x Nothing Style UI

### Original Problem Statement
Build a hyper-stylized website with "Kinetic Dot-OS" UI following Howard.le motion design principles + Nothing OS aesthetic. The UI implements **Layout Projection**, **Shared Element Transitions**, and **Compound State Machines**.

### Design Spec
See `/app/design/KINETIC_UI_SPEC.md` for animation bible.

---

## What's Been Implemented

### ✅ Phase 1-3: Ghost Protocol Core (COMPLETE)
- Trust score visualization, leveling system
- ModPage with Split Gate, Void Shop, Timeline

### ✅ Kinetic Dot-OS: Howard.le Level UI (COMPLETE - Jan 23, 2025)

**The Stack (ReviewDeck) - 3 State Compound Animation:**
```
STACK (compact) → FAN (preview) → LIST (expanded)
```
- Cards physically transform with rotation (-8°, 0°, +8°) and translation
- Spring physics on all transitions (`stiffness: 400, damping: 20`)
- Layout animation enables neighbor widgets to reflow smoothly

**Fluid Bento Grid:**
- `flex-wrap` based layout with `motion.div layout` prop
- Widgets are "Floating Islands" that respond to expansion
- Stagger entrance animation (`staggerChildren: 0.12`)

**Live Components:**
- `LiveTicker` - Pause on hover, red recording dot
- `ActivePoll` - Dotted progress bars with live updates
- `KineticWidget` - Base island with breathing animation
- `OSWidget`, `LabSlider` - On ModPage ecosystem

**Visual Dialect:**
- JetBrains Mono typography
- Monochrome palette with #FF0000 red accents only
- 32px border-radius, glass-morphism backdrop

### Verified No Regressions
- `/marketplace` ✅
- `/swap` ✅

---

## Prioritized Backlog

### P1 - High Priority
- **Morphing Cards**: Small widget stretches to become full-width modal (layoutId transition)
- **Phase 4 Evolution**: `DecryptionCube.jsx`, `ClassSelection.jsx`

### P2 - Medium Priority
- **Ghost OS Menu** - Neural Hub concept
- **ProductCard panel verification**

### P3 - Future
- Voice & Screen Share
- Social features
- Tinkoff + Cryptomus payments

---

## Architecture

```
/app/
├── design/
│   └── KINETIC_UI_SPEC.md      # Animation Bible
└── frontend/src/components/
    ├── kinetic/
    │   ├── KineticWidget.jsx   # Base floating island
    │   ├── ReviewDeck.jsx      # 3-state stack (Stack→Fan→List)
    │   ├── LiveTicker.jsx      # Running news
    │   ├── ActivePoll.jsx      # Live voting
    │   ├── OSWidget.jsx        # System status
    │   ├── LabSlider.jsx       # Concept slider
    │   └── kinetic.css         # All kinetic styles
    ├── HomePage.jsx            # Fluid Bento Dashboard
    └── ModPage.jsx             # Temple with Kinetic Ecosystem
```

### Key Patterns (from KINETIC_UI_SPEC.md)
```javascript
// Spring presets
const springSmooth = { type: "spring", stiffness: 300, damping: 30 };
const springBouncy = { type: "spring", stiffness: 400, damping: 20 };

// Stagger container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

// Layout animation (enables reflow)
<motion.div layout layoutId="unique-id">
  {content}
</motion.div>
```

---

## 3rd Party Integrations
- `framer-motion` (LayoutGroup, AnimatePresence, layout prop)
- `lucide-react`
- `recharts`
