from google import genai
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()  # reads .env into environment
GEMINI_API_KEY = os.getenv("GEMINI_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_KEY not set. Add it to a .env file or your environment.")

client = genai.Client(api_key=GEMINI_API_KEY)

def geminiCall():
  response = client.models.generate_content(
    model="gemini-3-flash-preview", contents= 
    '''You are an inventory assistant. I will provide store data as CSV. 
      Please generate restock suggestions in **strict JSON format**, following this schema:
      "inventory": [
        {
        "product_name": "<Product Name>",
        "stock": <current stock>,
        "restock_quantity": <integer>,
        "priority": "<low|medium|high>"
        }
      ]

    Do not include explanations, markdown, or extra characters. Only return valid JSON. If you do not see any data return an open {}. Enssure indentation is correct for JSON. Here is the data: '''
    + 
    '''{
	    "inventory": [
		    {
			    "sku": "Turkey",
			    "stock": 50,
			    "Past Sales in 14 Days": 60,
			    "Holiday": "Thanksgiving"
		    },
		    {
			    "sku": "Swimsuits",
			    "stock": 300,
			    "Past Sales in 14 Days": 6,
			    "Holiday": "Thanksgiving"
		    }
	    ]
    }'''


  )
  return response.text


def analyze_risk_with_gemini(products: list[dict], context: dict, forecast_days: int) -> str:
  """Build a prompt for Gemini and return forecast table as JSON."""
  import json
  prompt = f"""You are an inventory risk analyst. Given the following product data and business context, analyze demand risk and return a forecast table.

Product data (inventory table):
{json.dumps(products, indent=2)}

Business context (user-provided text fields):
- upcoming_holidays_events: {context.get('upcomingHolidays', '') or '(none)'}
- weather_forecast: {context.get('weatherForecast', '') or '(none)'}
- special_events_promotions: {context.get('specialEvents', '') or '(none)'}
- seasonal_trends: {context.get('seasonalTrends', '') or '(none)'}
- budget: {context.get('budget', '') or '0'}
- forecast_period_days: {forecast_days}

For each product, estimate demand over the next {forecast_days} days considering the context. Return a JSON array only (no markdown, no explanation) with exactly these keys per item:
- "productName": string
- "currentStock": number (from input)
- "forecast": number (estimated demand in the period)
- "shortageUnits": number (max(0, forecast - currentStock))
- "criticality": string, one of "Low", "Medium", "High"
- "profitAtRisk": number (shortageUnits * (sellingPrice - costPerUnit) from input if available, else 0)

Sort by profitAtRisk descending. Return only the JSON array, e.g. [{{"productName":"...","currentStock":0,"forecast":0,"shortageUnits":0,"criticality":"Low","profitAtRisk":0}}]"""

  response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=prompt,
  )
  return response.text if response.text else "[]"