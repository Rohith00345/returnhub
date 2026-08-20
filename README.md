# ReturnHub — Risk-Tiered Returns Automation Platform

> **Live Prototype:** [returnhub-one.vercel.app](https://returnhub-one.vercel.app/)  
> **Product Documentation:** [Read Full PRD (PRD.md)](./PRD.md)

---

## Executive Summary
ReturnHub is an automated e-commerce returns orchestration platform designed from an Associate Product Manager (APM) perspective to eliminate one-size-fits-all return queues. By replacing uniform manual checks with a dynamic 3-tier risk engine, ReturnHub auto-approves low-risk claims instantly while routing high-value assets to mandatory technical audits.

## Core Problem Statement
Traditional return systems process a **₹300 T-shirt** through the exact same manual queue as a **₹2,00,000 camera**. This creates operational backlogs, delays refunds for low-risk customers, and exposes merchants to high-value fraud.

## Key Features & Risk Architecture
* **Low Risk (< ₹2,000):** Instant auto-approval upon initial carrier scan.
* **Medium Risk (₹2,000 – ₹20,000 / Opened):** Field/doorstep agent physical verification checklist.
* **High Risk (> ₹20,000 / High-Value Tech):** Mandatory warehouse technical audit and serial number validation prior to refund release.
* **Agent Exception Handling:** Auditable manual override dashboard for support teams to handle edge cases.

## Targeted Success Metrics (KPIs)
* **North Star Metric:** 80%+ Automated Resolution Rate
* **Average Handling Time (AHT):** Reduced from ~180s to < 30s
* **Fraud Exposure:** Reduced from ~2% to < 0.5%
* **CSAT:** Target score of 4.5+/5

## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS
* **Deployment:** Vercel Edge Serverless
