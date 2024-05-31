from typing import Optional
import uvicorn
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

origins = ["*"]

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

if __name__ == "__main__":
    uvicorn.run("main:app", port=5000, reload=True)