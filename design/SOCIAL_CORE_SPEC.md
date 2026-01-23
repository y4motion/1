# 🌐 SOCIAL CORE - ARCHITECTURE SPEC
## The Network + The Consensus + Hall of Monarchs

---

## 📐 ВЫСОКОУРОВНЕВАЯ АРХИТЕКТУРА

```
/community (Hub)
│
├── /network              # THE GHOST NETWORK (Лента)
│   ├── Masonry Grid постов
│   ├── Категории: Hardware, Software, Battlestations, Guides
│   ├── Video hover preview
│   └── Create Post flow
│
├── /consensus            # THE CONSENSUS (Биржа Идей)
│   ├── King of the Hill ranking
│   ├── RP Economics (500 создать, 50 голосовать)
│   ├── Anti-Duplicate AI check
│   └── Comments system
│
├── /monarchs             # HALL OF MONARCHS (Рейтинги)
│   ├── Leaderboards (Month/Year/All Time)
│   ├── Achievement showcase
│   └── Mini-profiles
│
└── /vault                # MY VAULT (Личное)
    ├── Drafts
    ├── Saved posts
    └── Moderation queue
```

---

## 🗃️ DATABASE MODELS

### Post (Network)
```python
{
  "_id": ObjectId,
  "author_id": ObjectId,
  "type": "post" | "video" | "guide" | "review",
  "category": "hardware" | "software" | "battlestations" | "guides",
  "title": str,
  "content": str,  # Markdown
  "media": [
    { "type": "image" | "video", "url": str, "thumbnail": str }
  ],
  "tags": [str],
  "product_refs": [ObjectId],  # Linked products
  "stats": {
    "views": int,
    "likes": int,
    "comments": int,
    "saves": int
  },
  "status": "draft" | "pending" | "published" | "rejected",
  "created_at": datetime,
  "updated_at": datetime
}
```

### Idea (Consensus)
```python
{
  "_id": ObjectId,
  "author_id": ObjectId,
  "category": "site" | "products" | "software" | "community",
  "title": str,
  "description": str,
  "cost_rp": 500,  # RP spent to create
  "votes": [
    { "user_id": ObjectId, "trust_score": float, "rp_spent": 50 }
  ],
  "vote_score": float,  # Calculated: sum(votes * trust_score)
  "status": "open" | "in_progress" | "implemented" | "rejected",
  "comments": [
    { "user_id": ObjectId, "text": str, "created_at": datetime }
  ],
  "similar_check_hash": str,  # For AI duplicate detection
  "created_at": datetime
}
```

### Achievement
```python
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "type": str,  # "first_post", "idea_implemented", "top_month"
  "title": str,
  "icon": str,
  "unlocked_at": datetime
}
```

---

## 💰 RP ECONOMICS

### Costs
| Action | RP Cost | XP Reward |
|--------|---------|-----------|
| Create Post | 0 | +50 |
| Create Idea | 500 | +100 |
| Vote on Idea | 50 | +10 |
| Idea Implemented | -500 (refund) | +5000 |
| Top of Month | - | +2000 |

### Anti-Spam
- Minimum Level 5 to post
- Minimum Level 10 to create ideas
- Rate limit: 5 posts/day, 3 ideas/week
- Duplicate check blocks similar ideas

---

## 🎨 FRONTEND COMPONENTS

### /components/social/
```
├── NetworkFeed.jsx         # Main masonry grid
├── PostCard.jsx            # Individual post card
├── PostCreate.jsx          # Post creation modal
├── VideoPreview.jsx        # Hover video player
│
├── ConsensusList.jsx       # Ideas list with ranking
├── IdeaCard.jsx            # Individual idea
├── IdeaCreate.jsx          # Idea creation (with RP cost)
├── VoteButton.jsx          # Vote with RP confirmation
├── SimilarCheck.jsx        # AI duplicate warning
│
├── MonarchsBoard.jsx       # Leaderboard tables
├── UserMiniProfile.jsx     # Hover profile card
├── AchievementBadge.jsx    # Achievement display
│
├── CommunityPulse.jsx      # Homepage widget (flip card)
└── VaultTabs.jsx           # Drafts/Saved/Moderation
```

### /pages/
```
├── CommunityHub.jsx        # /community landing
├── NetworkPage.jsx         # /community/network
├── ConsensusPage.jsx       # /community/consensus
├── MonarchsPage.jsx        # /community/monarchs
└── VaultPage.jsx           # /community/vault
```

---

## 🔌 API ENDPOINTS

### Network (Posts)
```
GET  /api/network/feed?category=&page=&limit=
GET  /api/network/post/:id
POST /api/network/post             # Create post
PUT  /api/network/post/:id         # Update
DEL  /api/network/post/:id
POST /api/network/post/:id/like
POST /api/network/post/:id/save
```

### Consensus (Ideas)
```
GET  /api/consensus/ideas?category=&sort=&page=
GET  /api/consensus/idea/:id
POST /api/consensus/idea           # Create (costs 500 RP)
POST /api/consensus/idea/:id/vote  # Vote (costs 50 RP)
POST /api/consensus/idea/:id/comment
GET  /api/consensus/similar-check  # AI duplicate check
```

### Monarchs (Leaderboards)
```
GET  /api/monarchs/top?period=month|year|all&limit=
GET  /api/monarchs/user/:id/achievements
GET  /api/monarchs/user/:id/mini-profile
```

### Vault
```
GET  /api/vault/drafts
GET  /api/vault/saved
GET  /api/vault/pending-moderation
```

---

## 🧩 INTEGRATION POINTS

### 1. Homepage Widget (CommunityPulse)
```jsx
// Flip card showing:
// Front: Top post from Network (image + title)
// Back: Top idea from Consensus (progress bar)
// Expand button → /community
```

### 2. NeuralHub Menu Section
```jsx
// SOCIAL PROTOCOLS section
// [ THE NETWORK ] - red dot if new posts
// [ CONSENSUS ] - red dot if new votes on your ideas
// [ MY VAULT ] - badge with draft count
```

### 3. Level Menu Integration
```
Level 5:  Unlock posting
Level 10: Unlock idea creation
Level 20: Unlock "Hall of Monarchs" special features
```

---

## 📋 IMPLEMENTATION PHASES

### PHASE 1: Foundation (Backend)
- [ ] Create MongoDB collections
- [ ] Network API endpoints (CRUD)
- [ ] Consensus API endpoints (with RP logic)
- [ ] Monarchs API endpoints

### PHASE 2: Network UI
- [ ] NetworkFeed.jsx (Masonry)
- [ ] PostCard.jsx
- [ ] PostCreate.jsx modal
- [ ] Category tabs
- [ ] NetworkPage.jsx

### PHASE 3: Consensus UI
- [ ] ConsensusList.jsx
- [ ] IdeaCard.jsx with vote button
- [ ] IdeaCreate.jsx with RP cost
- [ ] SimilarCheck.jsx mock
- [ ] ConsensusPage.jsx

### PHASE 4: Monarchs & Vault
- [ ] MonarchsBoard.jsx
- [ ] UserMiniProfile.jsx hover card
- [ ] VaultPage.jsx with tabs

### PHASE 5: Integration
- [ ] CommunityPulse.jsx widget
- [ ] NeuralHub menu section
- [ ] Notifications (red dots)
- [ ] CommunityHub.jsx landing

---

## 🎯 KING OF THE HILL FORMULA

```javascript
// Ranking score calculation
const calculateIdeaScore = (idea) => {
  const baseVotes = idea.votes.length;
  const weightedVotes = idea.votes.reduce((sum, vote) => {
    return sum + (vote.rp_spent * vote.trust_score);
  }, 0);
  
  const ageDecay = Math.exp(-0.01 * daysSinceCreation);
  
  return weightedVotes * ageDecay;
};
```

---

## 🛡️ ANTI-DUPLICATE AI (Mock)

```javascript
// Frontend check before submitting idea
const checkSimilarIdeas = async (title, description) => {
  // Mock implementation - will call AI later
  const keywords = extractKeywords(title + ' ' + description);
  const existingIdeas = await fetch('/api/consensus/similar-check', {
    method: 'POST',
    body: JSON.stringify({ keywords })
  });
  
  return existingIdeas.filter(idea => similarity > 0.7);
};
```

---

*Document Version: 1.0*
*Date: January 2025*
*Status: READY FOR IMPLEMENTATION*
