---
name: ui-ux-pro-max
description: >-
  World-class, elite UI/UX engineering reference inspired by 21st.dev, Linear, Vercel,
  Stripe, and Aceternity UI. Enforces high-density data typography, tactile micro-interactions,
  spring physics via Framer Motion, glassmorphism, and responsive ergonomics.
---

# UI / UX Pro Max — Elite Design System & Engineering Guide

This skill equips the assistant with world-class product design principles, design engineering patterns, and component recipes inspired by **21st.dev**, **Aceternity UI**, **Magic UI**, **Linear**, and **Vercel**.

---

## Core Tenets of Elite UI/UX

1. **Zero Dead Pixels & Purposeful Motion**:
   - Every movement has meaning. Use spring physics (`damping: 25`, `stiffness: 300`) instead of linear fades.
   - Micro-interactions (hover lift, tactile click scales, glow boundaries) give immediate physical presence.

2. **21st.dev Component Architecture**:
   - **Border Beam**: Moving laser/glow gradient around active elements to draw attention without shouting.
   - **Spotlight Hover**: Radial gradient tracking cursor coordinates on cards, revealing depth and material texture.
   - **Background Beams / Matrix Grids**: Subtle SVG grid lines masked by radial falloff, providing architectural depth.
   - **Shimmer & Skeleton**: Skeleton states must shimmer with directional light to eliminate perception of latency.

3. **High-Density Scientific & Web3 Telemetry**:
   - Numeric figures must be formatted clearly with monospace fonts (`font-mono`) for precision.
   - Live states must use pulsing indicators (`w-2 h-2 rounded-full animate-pulse`).
   - Cryptographic hashes (e.g. `0x71C8…B42e`) must provide instant 1-click clipboard copy with visual checkmark confirmation.

4. **Ergonomic Color Harmony & Contrast**:
   - Dark mode background: Deep onyx/slate (`#030712`, `#0B0F19`) over pure black `#000000` to prevent OLED smear.
   - Accent palette:
     - Emerald (`#10B981` / `#34D399`): Primary action, health, ecological verification.
     - Cyan (`#06B6D4`): Satellite MRV, scientific telemetry, live streams.
     - Violet / Polygon (`#8247E5`): Blockchain transactions, smart contracts, Web3 identity.
     - Amber (`#F59E0B`): Alerts, non-blocking notices, network switches.
     - Crimson (`#EF4444`): Irreversible operations (token burning, retirements).

5. **Accessibility & Responsive Resilience**:
   - Touch targets must never be smaller than 44×44px on mobile screens.
   - Dark/Light mode transitions must be seamless using CSS variables (`--bg`, `--card`, `--text`, `--border`).
   - Full keyboard accessibility and focus rings on all interactive elements.

