from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import upload, ocr, data_analysis, generation, project

app = FastAPI(title="论文牛马 API", version="1.0.0")

# 配置跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发阶段允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(data_analysis.router, prefix="/api/data", tags=["Data Analysis"])
app.include_router(generation.router, prefix="/api/generate", tags=["Generation"])
app.include_router(project.router, prefix="/api/project", tags=["Project"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Paper Niuma API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
