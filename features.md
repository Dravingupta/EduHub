# Features Document: Adaptive Learning Core Engine

This document outlines the core platform features to guide development and support the final hackathon pitch. Our platform is not just an AI wrapper; it is a **Token-Efficient Learning Intelligence Engine** that leverages deterministic evaluation and adaptive context mechanisms.

## 1. Universal & Custom Subjects
- **Universal Subjects:** Pre-defined courses (e.g., Physics JEE, Biology NEET) that utilize a shared, aggressively pre-generated database of full lesson blocks and Test Banks. This reduces LLM API costs to zero for initial user discovery while ensuring instantaneous load times.
- **Custom Subjects:** User-defined subjects (e.g., BA LLB topics) where users enter their own course syllabus, and the LLM dynamically structures it into chapters and topics on the fly.
- **Independent Context:** Each subject maintains isolated memory for the user, tracking `topic_mastery`, `explanation_density`, and `swap_count` without cross-contamination.

## 2. Instant Universal Content & Flexible Pacing
- **Fully Unlocked Curriculum:** Unlike rigid drip-feed platforms, all topics within a Subject are instantly available to the user from day one.
- **Self-Directed Learning:** We removed arbitrary timeline pacing constraints (e.g. "120 days"). Instead, users move through the progressively organized modules at their own speed. You can jump ahead or revisit past topics freely.
- **Dynamic Caching:** If a user requests a Universal topic, the pre-generated lesson is fetched instantly from MongoDB. Only custom regeneration (Swaps) or Custom Subjects trigger the LLM.

## 3. Progressive "Visual" Lesson Delivery
- **Structured JSON Engine:** Instead of large Markdown text walls, lessons are generated as structured JSON arrays combining different block types.
- **Interactive Visual Cards:** Renders blocks visually using dedicated UI components:
  - `concept`: Clean typography cards with mathematical LaTeX rendering.
  - `diagram`: Flowcharts compiled natively by rendering safe `graph TD` Mermaid.js syntax.
  - `example`: Interactive step-by-step applications.
  - `mistakes`: Red-alert callout boxes for common pitfalls.
  - `summary`: Bulleted summary cards.
- **Regeneration & Tuning:** Users can interactively tune the "density" rating directly on any given block.

## 4. The Adaptive "Swap" Engine
- **Real-time Feedback Loop:** If a block is "Over-explained" or "Under-explained," the user inputs feedback using an inline dial mechanism.
- **Intelligent Regeneration:** Submitting feedback updates the subject's `explanation_density_preference` context, triggering an immediate "Swap" (regeneration) targeted precisely to the user's calibration scale.
- **Controlled Usage:** Swaps can be limited per session to protect AI token scalability while guaranteeing extreme personalization without manual prompting.

## 5. Standardized Evaluation & Assignments
- **Stable Metrics:** While lessons are dynamic and highly personalized, tests are standard and deterministic for fair measurement.
- **10-MCQ Structure:** Every assignment targets a specific breakdown: e.g. 4 Easy, 4 Medium, 2 Hard.
- **Immediate Learning & Conversational AI:** Upon submission, the platform immediately evaluates answers. If a student answers incorrectly, they can trigger an inline "AI Tutor" chat widget to conversationally ask the LLM *why* their specific answer was wrong.

## 6. Deterministic Mastery Calculation
- **Weighted Formula:** Topic mastery is calculated via `[(Easy Accuracy × 0.3) + (Medium Accuracy × 0.4) + (Hard Accuracy × 0.3)]`.
- **Progression Gate:** A Mastery Score of **>= 65%** is required to officially master the topic and upgrade the user's strong-topic context. Scores **< 65%** enforce a retry loop and log weak topics for analytics tracking.
