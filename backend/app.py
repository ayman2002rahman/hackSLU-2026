from fastapi import FastAPI
from MCPsetup import geminiCall

app = FastAPI()

@app.get("/")
def root():
    return {"message": "FastAPI is working!"}

@app.get("/test")
def test():
    testResult = geminiCall()
    return {"response": testResult}