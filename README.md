# ACUITY

**Fintech & Financial Empowerment** — hackSLU 2026

Create apps or platforms for personal finance, secure transactions, financial inclusion, or investment education.

*Guiding Themes: How can tech make financial services more accessible and secure? What solutions could support personal or small-business finance?*

---

## Inspiration

Our inspiration for ACUITY comes from the need to make inventory and cash-flow management accessible to small businesses and individuals. We saw that many owners lack tools that combine real-time inventory data with actionable financial insights. We wanted to build something that turns product and sales data into clear risk analysis and restock decisions—so running a business feels less guesswork and more like having a financial co-pilot.

## What it does

ACUITY is a web app that helps you manage inventory and understand the financial impact of your stock. It supports **personal or small-business finance** by:

- **Current State** — View all products, current stock, costs, selling prices, and derived inventory value. Add, edit, and delete products so your data stays in sync.
- **Future Risk & Action** — Enter business context (holidays, weather, events, trends, budget) and get AI-powered risk analysis. See which products are at risk of stockout, shortage units, criticality, and profit at risk. Get a prioritized restock plan and visualize demand over time.
- **Send Orders** — Build purchase orders by selecting products and quantities, then send a formatted order summary to vendors by email.

Inventory is stored in the cloud so you can access it from anywhere and keep it secure.

## How we built it

ACUITY has a **React** front-end (Vite, TypeScript) with a clean UI and **DM Sans** typography. We use **Supabase** for the products database so inventory is persistent and manageable. The **Future Risk & Action** flow sends product and context data to a **FastAPI** backend, which builds a prompt and calls **Google Gemini** to produce the forecast table (current stock, forecast, shortage units, criticality, profit at risk). We use **EmailJS** to send purchase-order emails to vendors with an order summary that matches the in-app layout. The app stays responsive and accessible with a simple, focused design.

## Challenges we ran into

We ran into configuration and integration challenges: wiring the front-end to Supabase (env vars, table shape, and RLS), shaping the Gemini prompt and response so the forecast table was consistent and parseable, and formatting the EmailJS template so the vendor email looked like the in-app order summary. Aligning backend column names with the front-end product model and handling loading and error states across pages also required careful iteration.

## Accomplishments we're proud of

We’re proud of shipping a full flow from **inventory → context → AI analysis → actionable table and restock plan**, and of making it usable for small businesses: cloud-backed product data, optional business context for better forecasts, and one-click purchase orders to vendors. Delivering a single, coherent experience (ACUITY branding, consistent font, and no exposed implementation details in the UI) was an important milestone for us.

## What we learned

We learned how to structure a prompt and response for an LLM (Gemini) so the front-end gets stable, structured data. We also got hands-on with Supabase for CRUD and with EmailJS for sending formatted emails from the client. We reinforced the importance of clear env configuration, error handling, and loading states so the app feels reliable even when services are slow or misconfigured.

## What's next for ACUITY

We’d like to add more **financial empowerment** features: simple cash-flow views, basic reporting, and optional reminders or alerts for low stock and restock dates. We could also improve the AI side (e.g., multi-period forecasts or scenario comparisons) and explore tighter integrations with accounting or payment tools so ACUITY fits even better into small-business workflows.

## Built With

- **Front-end:** React, Vite, TypeScript, Tailwind CSS, Radix UI, Recharts
- **Database:** Supabase
- **Backend:** FastAPI, Python
- **AI:** Google Gemini (google-genai)
- **Email:** EmailJS
