export const projectDetails = {
  zayfinds: {
    overview:
      "ZAYFINDS is a curated e-commerce discovery platform for affordable replica fashion and lifestyle products. Built with the philosophy of 'We do not gate keep over here,' it serves as an accessible directory that aggregates products from trusted sellers and provides users with a clean, modern browsing experience. The platform features product browsing across 9 categories (Tops, Shorts, Pants, Shoes, Outerwear, Accessories, Room decor, Electronics, Vehicle Modifications), search functionality, price sorting, category filtering with URL sync, and pagination—all while maintaining direct links to external sellers rather than operating as a direct store.",
    challenge:
      "The replica fashion market is often fragmented and difficult to navigate, with sellers scattered across various platforms and communities. Finding affordable, quality items requires significant time and knowledge of trusted sources. Many discovery platforms gatekeep information or require memberships, making it inaccessible to those who need affordable fashion options the most.",
    solution:
      "ZAYFINDS solves this by creating a centralized, curated discovery platform that aggregates products from trusted sellers in one clean interface. The platform focuses on discovery rather than transactions—users can browse, search, filter, and sort products, then click through to external sellers directly. This approach removes gatekeeping barriers while providing a modern, accessible browsing experience that works seamlessly on mobile and desktop.",
    method:
      "Built with Next.js 16 using the App Router and TypeScript for type safety. The UI is styled with Tailwind CSS v4, following a minimal, modern design philosophy with a layered grey color system and the Syne display font. Product data is managed through static JSON files imported from CSV/Google Sheets, with helper functions in lib/products.ts handling data operations. The platform includes category mapping and inference from product names, an image override system for manual updates, and supports dynamic product count display. Key features include URL-synced category filtering, price sorting (low to high, high to low), search by product name, and pagination with 'Load More' functionality (20 items at a time). The homepage features a hero section with tagline and CTAs, vertical scrolling product showcase, category carousel, and dynamic product count display.",
    results:
      "The platform is live at zayfinds.vercel.app with over 2,488 products across 9 categories. All core features are functional: product browsing, search, category filtering with URL synchronization, price sorting, and pagination. The clean, mobile-first responsive design provides an excellent user experience, and the direct linking system successfully connects users to external sellers without requiring a checkout flow. The static data management approach ensures fast load times and easy product updates through the CSV-to-JSON conversion workflow.",
    ongoing:
      "Continuous product updates and category expansion as new items become available. Future improvements may include enhanced search capabilities, user favorites/wishlist functionality, seller verification badges, and analytics to track popular products and categories. The platform will continue to grow its curated product database while maintaining its core philosophy of accessibility and no gatekeeping."
  },
  exosense: {
    overview:
      "ExoSense is an ongoing research project at Yale’s Faboratory that develops a multi-sensor wearable motion‑tracking system for an upper‑body soft exosuit. It provides the sensing backbone that lets the exosuit perceive human motion in real time and respond with adaptive assistive actuation. The current firmware, FaboIMUrig (Baseline v0.4), implements a scalable, node‑based architecture for multi‑IMU calibration—combining quaternion math, reference‑pose alignment, and synchronized streaming to capture complex limb movements with high precision.",
    challenge:
      "Accurate, drift‑resistant orientation tracking across multiple sensors on a flexible, soft‑fabric system is difficult. Each IMU can shift or twist as the user moves; coordinating multiple I²C devices (IMUs, capacitive sensors, and a multiplexer) requires careful hardware/firmware design to maintain timing precision and bandwidth.",
    solution:
      "The system uses a distributed calibration + fusion pipeline that treats each IMU as an independent node with bias correction, zero‑pose averaging, and heading alignment. A TCA9548A multiplexer manages channel routing to multiple BNO085 IMUs, while a custom quaternion library (Quat.h/.cpp) handles rotation math, normalization, and yaw extraction. An Adafruit Feather nRF52840 Sense aggregates orientation data plus capacitive touch inputs (dual MPR121 boards) for muscle‑contact feedback. The firmware streams synchronized orientation + touch at 50 Hz for visualization and ML pipelines.",
    method:
      "Firmware in C++ (Arduino framework) using modular classes (e.g., BnoNode) for scalability and maintainability. Each node owns its I²C channel, calibration, and quaternion computation before synchronized logging. Current features include gyro‑bias calibration, reference‑pose capture, heading alignment (GameRV), and CSV streaming for dataset collection. The design supports clean scaling (now 4 IMU nodes + 2 MPR121 boards) and cross‑node synchronization for reliable temporal coherence.",
    results:
      "v0.4 demonstrates stable multi‑sensor streaming at 50 Hz with consistent quaternion integrity and minimal drift under motion. Preliminary motion‑capture tests show strong agreement across nodes for common gestures (arm flexion, shoulder rotation). The architecture supports larger node arrays and will serve as the base for multimodal sensing + control in upcoming soft‑exosuit prototypes.",
    ongoing:
      "Next: guided mount‑alignment calibration, low‑pass filtering, real‑time 3D visualization, and building a motion dataset for perception models. Later: sensor‑fusion refinement and AI‑driven pose estimation to enable closed‑loop adaptive assistance."
  },
  "agentic-gridworld": {
    overview:
      "Game Agents is my personal sandbox for learning agentic development from first principles. Instead of relying on pre-built frameworks, I am building everything from scratch, including the worlds, the tools, the agent loops, and the planners. The environment is now MCP ready: the GridWorld runs as a tool server that external agents and LLMs can control via standard tool calls. The long-term goal is to master agentic thinking and agentic engineering across any domain: games, embedded systems, robotics, productivity, business automation, and beyond. This project uses games as a fun and visual way to explore agent capabilities, decision-making, perception, and tool usage.",
    challenge:
      "How can I teach myself agentic development effectively—and make the process genuinely enjoyable? I needed a hands‑on way to practice perception, planning, tools, and control loops without the overhead of large frameworks.",
    solution:
      "Start by building agents for simple, custom game environments, then scale the same architecture to richer worlds (e.g., Minecraft or Terraria). Everything is engineered from scratch so the concepts transfer cleanly as complexity grows.",
    method:
      "Built a custom GridWorld (10x10) and tool interface to study agentic systems. The agent interacts only via tools (observe, move, pickup, craft), enabling a clean agent loop of observe -> plan -> act -> observe. The environment supports borders, items, inventory, crafting (torch = coal + stick), and goals, forming a realistic, minimal lab for agent behavior. Milestones 0 to 3 established a perception driven agent that locates items, picks up resources, and crafts the torch to complete a multi step goal. Milestone 4 adds an MCP server (mcp_gridworld_server.py) using FastMCP over STDIO, exposing observe, move, pickup, and craft as schema described tools, validated with the MCP Inspector. The world now behaves like a portable tool service that any MCP capable agent can connect to.",
    results:
      "End to end verified: launched the MCP server, connected with MCP Inspector, invoked tools, observed live world updates, and crafted using protocol calls. This lifts the environment from a local Python loop to a portable, externally controlled tool API, laying the foundation for an LLM planner next.",
    ongoing:
      "Next milestones: integrate an LLM planner (Milestone 5) for decision making from observations, and add a second game world (Milestone 6) using Pygame or a custom design. Repository: https://github.com/Alienware2000/game-agents"
  }
};


