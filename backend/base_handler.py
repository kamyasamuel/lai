import tornado.web

class BaseCORSHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        # Allow React dev server on port 5173
        allowed_origin = self.request.headers.get("Origin")
        allowed_origins = [
            "https://lawyers.legalaiafrica.com",
            "http://localhost:5173",
            "http://localhost:3000"
        ]

        if allowed_origin and allowed_origin in allowed_origins:
            self.set_header("Access-Control-Allow-Origin", allowed_origin)

        self.set_header("Access-Control-Allow-Credentials", "true")
        self.set_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.set_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Access-Control-Allow-Origin, Authorization"
        )

    def options(self):
        # No body for preflight `OPTIONS` requests
        self.set_status(204)
        self.finish()