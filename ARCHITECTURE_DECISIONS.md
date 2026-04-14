# Architecture Decisions

This document records the major architectural decisions, following a chronological order to establish the corporate memory.

## Date: 2026-04-14
**Decision:** Implementation of an isolated `SEO_DESCRIPTION` LangGraph node inside the `ai-agents` library.
**Rationale:** The platform is evolving from merely syncing product details to intelligently generating high-conversion sales and SEO texts for e-commerce integration. A distinct LangGraph node ensures that the product description functionality scales independently without burdening standard retrieval processes (RAG) or logic tool requests. The node is explicitly bypassed to reduce token waste if `productContext` is missing from the request context, delivering prompt corrective guidance rather than empty LLM generations.
