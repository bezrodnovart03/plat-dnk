import httpx
from fastapi import FastAPI, Request, Response, HTTPException
from jose import jwt, JWTError

app = FastAPI(title="API Gateway")

SECRET_KEY = "SUPER_SECRET_KEY_FOR_HACKATHON"
ALGORITHM = "HS256"

#  Локально (для теста) - 127.0.0.1
SERVICES = {
    "auth": "http://auth-service:8001",
    "tests": "http://test-service:8002",
    "sessions": "http://session-service:8003",
    "reports": "http://report-service:8004"
}

# Список путей, куда МОЖНО без токена
PUBLIC_PATHS = [
    "/api/auth/login",
    "/api/public/"
]

@app.middleware("http")
async def auth_filter(request: Request, call_next):
    """
    ЭТОТ МЕТОД — ФИЛЬТР. Тут мы проверяем всех людишек кто не USER_PUBLIC
    """
    path = request.url.path
    
    # Если путь публичный то и черт с ним
    if any(path.startswith(p) for p in PUBLIC_PATHS):
        return await call_next(request)

    # Если путь защищенный ищем заголовок Authorization
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return Response(content="Нужен токен (Authorization: Bearer ...)", status_code=401)

    token = auth_header.split(" ")[1]

    # Проверяем токен на зрелость
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Как то можно добавить данные из токена в запрос, чтобы микросервисы их видели, но я не хочу, поэтому только это
        request.state.user_id = payload.get("sub")
        request.state.user_role = payload.get("role")
    except JWTError:
        return Response(content="Токен не валиден или просрочен", status_code=401)

    # Если всё ок, то заебумба
    return await call_next(request)


@app.api_route("/api/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def reverse_proxy(service: str, path: str, request: Request):
    """
    ЭТОТ МЕТОД — ПРОКСИ. Это наши кластные маршрутики-запросиков, можно было бы взять Laravel но ладно(
    """

    if service not in SERVICES:
        raise HTTPException(status_code=404, detail="Микросервис не найден")

    # Собираем наш полный URL
    target_url = f"{SERVICES[service]}/{path}"
    
    # Пересылаем запрос
    async with httpx.AsyncClient() as client:
        # Копируем тело запроса только если это POST
        body = await request.body()
        
        # Делаем запрос в микросервис
        proxy_response = await client.request(
            method=request.method,
            url=target_url,
            params=request.query_params,
            headers=dict(request.headers),
            content=body,
            timeout=10.0 # Ну так надо
        )
    
    # Возвращаем ответ от микросервиса обратно клиенту 
    return Response(
        content=proxy_response.content,
        status_code=proxy_response.status_code,
        headers=dict(proxy_response.headers)
    )