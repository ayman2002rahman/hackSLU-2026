import json
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from MCPsetup import geminiCall, analyze_risk_with_gemini

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProductPayload(BaseModel):
    id: str
    name: str
    currentStock: float
    costPerUnit: float
    sellingPrice: float
    averageDailySales: float


class ContextPayload(BaseModel):
    upcomingHolidays: str = ""
    weatherForecast: str = ""
    specialEvents: str = ""
    seasonalTrends: str = ""
    budget: str = "1000"


class AnalyzeRiskRequest(BaseModel):
    products: list[ProductPayload]
    context: ContextPayload
    forecastDays: int = 14


def _parse_gemini_json(raw: str) -> list:
    """Extract JSON array from Gemini response (may be wrapped in markdown)."""
    text = (raw or "").strip()
    # Remove markdown code block if present
    if "```" in text:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if match:
            text = match.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return []


@app.get("/")
def root():
    return {"message": "FastAPI is working!"}


@app.get("/test")
def test():
    testResult = geminiCall()
    return {"response": testResult}


@app.post("/analyze-risk")
def analyze_risk(body: AnalyzeRiskRequest):
    """Accept product table + context, call Gemini, return forecast table."""
    try:
        products_dict = [p.model_dump() for p in body.products]
        context_dict = body.context.model_dump()
        raw = analyze_risk_with_gemini(products_dict, context_dict, body.forecastDays)
        forecast_table = _parse_gemini_json(raw)
        if not isinstance(forecast_table, list):
            forecast_table = []
        return {"forecastTable": forecast_table, "forecastPeriod": body.forecastDays}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))