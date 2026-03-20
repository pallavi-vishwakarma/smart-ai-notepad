/**
 * Seed Script - Creates demo user and sample notes
 * Run: node seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Note = require("./models/Note");

const SAMPLE_NOTES = [
  {
    title: "Quick Sort Algorithm",
    content: `<h2>Quick Sort</h2><p>Quick sort is a divide-and-conquer algorithm that picks a <strong>pivot</strong> element and partitions the array.</p><h3>Steps:</h3><ul><li>Pick a pivot (last, first, or random element)</li><li>Partition: elements smaller than pivot go left, larger go right</li><li>Recursively sort the sub-arrays</li></ul><pre><code>function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}</code></pre><p><strong>Time Complexity:</strong> O(n log n) average, O(n²) worst case</p>`,
    tags: ["algorithms", "sorting", "dsa"],
  },
  {
    title: "React Hooks Cheatsheet",
    content: `<h1>React Hooks Cheatsheet</h1><h2>useState</h2><p>Manage local component state.</p><pre><code>const [count, setCount] = useState(0);</code></pre><h2>useEffect</h2><p>Side effects: API calls, subscriptions, DOM updates.</p><pre><code>useEffect(() => {
  fetchData();
  return () => cleanup();
}, [dependency]);</code></pre><h2>useCallback</h2><p>Memoize functions to prevent unnecessary re-renders.</p><h2>useMemo</h2><p>Memoize expensive computations.</p><ul><li>Only recomputes when dependencies change</li><li>Returns memoized value</li></ul>`,
    tags: ["react", "hooks", "frontend"],
  },
  {
    title: "System Design: URL Shortener",
    content: `<h1>URL Shortener System Design</h1><h2>Requirements</h2><ul><li>Shorten long URLs to 7-char codes</li><li>100M URLs/day write, 10B reads/day</li><li>Links expire after 5 years</li></ul><h2>High-Level Design</h2><p>Use a <strong>hash function</strong> (base62 encoding of auto-increment ID) to generate short codes.</p><h3>Components:</h3><ol><li>Load Balancer → API Servers</li><li>Cache (Redis) for hot links</li><li>Database (MySQL + sharding)</li><li>CDN for redirect performance</li></ol><h2>Database Schema</h2><pre><code>CREATE TABLE urls (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE,
  original_url TEXT NOT NULL,
  user_id BIGINT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);</code></pre>`,
    tags: ["system-design", "interview", "backend"],
  },
  {
    title: "My Learning Goals 2025",
    content: `<h1>Learning Goals 2025 🎯</h1><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked /><span>Learn React + TypeScript</span></label></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox" /><span>Master System Design (Grokking the System Design Interview)</span></label></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox" /><span>Build 3 full-stack projects</span></label></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox" /><span>Solve 200 LeetCode problems</span></label></li><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked /><span>Learn Docker & Kubernetes basics</span></label></li></ul><h2>Books to Read</h2><ul><li>Clean Code - Robert Martin</li><li>Designing Data-Intensive Applications</li><li>The Pragmatic Programmer</li></ul>`,
    tags: ["goals", "learning", "personal"],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Create or find demo user
    let user = await User.findOne({ email: "demo@test.com" });
    if (!user) {
      user = await User.create({
        name: "Demo User",
        email: "demo@test.com",
        password: "demo123",
      });
      console.log("✅ Demo user created: demo@test.com / demo123");
    } else {
      console.log("ℹ️  Demo user already exists");
    }

    // Clear existing demo notes
    await Note.deleteMany({ user: user._id });

    // Create sample notes
    const notes = await Note.insertMany(
      SAMPLE_NOTES.map((n, i) => ({ ...n, user: user._id, order: i }))
    );
    console.log(`✅ Created ${notes.length} sample notes`);

    console.log("\n🚀 Seed complete! Login with: demo@test.com / demo123");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
