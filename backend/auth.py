import os
import json
import secrets
import hashlib
import time
from datetime import datetime, timedelta
import tornado
from tornado.web import RequestHandler, HTTPError
import tornado.auth
from main import BaseCORSHandler # type: ignore
from mongo_db import usersCollection, googleOAuthCollection, facebookOAuthCollection, samala_db

# Create a MongoDB collection for sessions
sessionsCollection = samala_db.sessionsCollection

# Create an index on the token field for faster lookups
sessionsCollection.create_index("token", unique=True)
# Create an index on expiration for cleanup operations
sessionsCollection.create_index("expires_at")

default_host = "http://localhost:4040" if os.getenv("ENV") == "DEV" else "https://lawyers.legalaiafrica.com"

class SignInHandler(BaseCORSHandler):
    def post(self):
        try:
            data = json.loads(self.request.body)
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"message": "Invalid JSON"})
            return

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            self.set_status(400)
            self.write({"message": "Email and password are required"})
            return

        # Check if user exists in MongoDB
        user = usersCollection.find_one({"email": email})
        
        if not user:
            self.set_status(401)
            self.write({"message": "Invalid email or password"})
            return

        # Hash the provided password and check
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        if hashed_password != user.get("password"):
            self.set_status(401)
            self.write({"message": "Invalid email or password"})
            return

        # Create session token with expiry
        token = secrets.token_hex(32)
        expires_at = int((datetime.now() + timedelta(days=1)).timestamp() * 1000)  # 24 hours from now
        
        # Store session in MongoDB
        sessionsCollection.insert_one({
            "token": token,
            "user_id": email,
            "expires_at": expires_at,
            "created_at": datetime.now().isoformat()
        })

        self.write({
            "token": token,
            "expiresAt": expires_at,  # Send expiry time to client
            "email": email,
            "name": user.get("name", "")
        })

    # Add to SignInHandler, SignUpHandler, OAuth handlers after session creation
    def create_session(self, user_id):
        # Generate a secure token
        token = secrets.token_hex(32)
        
        # Store in MongoDB with proper structure
        session_data = {
            "user_id": user_id,  # This should be the email address
            "token": token,
            "created_at": datetime.now().isoformat()
        }
        
        # Log session creation for debugging
        print(f"Creating session for user: {user_id} with token: {token[:10]}...")
        
        # Insert into MongoDB
        sessionsCollection.insert_one(session_data)
        
        return token

class SignUpHandler(BaseCORSHandler):
    def post(self):
        try:
            data = json.loads(self.request.body)
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"message": "Invalid JSON"})
            return

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            self.set_status(400)
            self.write({"message": "Email and password are required"})
            return

        # Check if user exists in MongoDB
        existing_user = usersCollection.find_one({"email": email})
        
        if existing_user:
            self.set_status(400)
            self.write({"message": "User already exists"})
            return

        # Hash password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        # Create user in MongoDB
        user_data = {
            "email": email,
            "password": hashed_password,
            "created_at": datetime.now().isoformat(),
            "provider": "email"
        }
        
        # Insert user into MongoDB collection
        result = usersCollection.insert_one(user_data)
        
        # Create session token with expiry
        token = secrets.token_hex(32)
        expires_at = int((datetime.now() + timedelta(days=1)).timestamp() * 1000)  # 24 hours from now
        
        # Store session in MongoDB
        sessionsCollection.insert_one({
            "token": token,
            "user_id": email,
            "expires_at": expires_at,
            "created_at": datetime.now().isoformat()
        })

        self.write({
            "token": token,
            "expiresAt": expires_at,  # Send expiry time to client
            "email": email
        })

    def create_session(self, user_id):
        # Generate a secure token
        token = secrets.token_hex(32)
        
        # Set expiration time (24 hours from now)
        expires_at = int((datetime.now() + timedelta(days=1)).timestamp() * 1000)
        
        # Store in MongoDB with proper structure
        session_data = {
            "user_id": user_id,  # This should be the email address
            "token": token,
            "expires_at": expires_at,  # Token expires after 24 hours
            "created_at": datetime.now().isoformat()
        }
        
        # Log session creation for debugging
        print(f"Creating session for user: {user_id} with token: {token[:10]}...")
        
        # Insert into MongoDB
        sessionsCollection.insert_one(session_data)
        
        return token

class GoogleOAuth2LoginHandler(BaseCORSHandler, tornado.auth.GoogleOAuth2Mixin):
    async def get(self):
        redirect_uri = self.application.settings.get('google_redirect_base_uri', default_host + "/auth/google/callback")
        if self.get_argument('code', None):
            access = await self.get_authenticated_user(
                redirect_uri=redirect_uri,
                code=self.get_argument('code')
            )
            user = await self.oauth2_request(
                "https://www.googleapis.com/oauth2/v1/userinfo",
                access_token=access["access_token"]
            )
            email = user.get("email")
            if not email:
                self.redirect("/?error=email_required")
                return
                
            # Check if user exists in MongoDB
            existing_user = usersCollection.find_one({"email": email})
            
            if not existing_user:
                # Create new user
                user_data = {
                    "email": email,
                    "name": user.get("name", ""),
                    "created_at": datetime.now().isoformat(),
                    "provider": "google"
                }
                usersCollection.insert_one(user_data)
                
                # Store OAuth info separately if needed
                googleOAuthCollection.insert_one({
                    "email": email,
                    "access_token": access.get("access_token"),
                    "refresh_token": access.get("refresh_token"),
                    "expires_at": access.get("expires_in"),
                    "created_at": datetime.now().isoformat()
                })
                
            token = secrets.token_hex(32)
            expires_at = int((datetime.now() + timedelta(days=1)).timestamp() * 1000)  # 24 hours from now
            
            # Store session in MongoDB
            sessionsCollection.insert_one({
                "token": token,
                "user_id": email,
                "expires_at": expires_at,
                "created_at": datetime.now().isoformat()
            })
            
            self.redirect(f"/#/dashboard?token={token}")
        else:
            self.authorize_redirect(
                redirect_uri=redirect_uri,
                client_id=self.settings.get("google_oauth", {}).get("key", os.getenv("GOOGLE_CLIENT_ID")),
                scope=['profile', 'email'],
                response_type='code',
                extra_params={'approval_prompt': 'auto'}
            )

    # Add to SignInHandler, SignUpHandler, OAuth handlers after session creation
    def create_session(self, user_id):
        # Generate a secure token
        token = secrets.token_hex(32)
        
        # Store in MongoDB with proper structure
        session_data = {
            "user_id": user_id,  # This should be the email address
            "token": token,
            "created_at": datetime.now().isoformat()
        }
        
        # Log session creation for debugging
        print(f"Creating session for user: {user_id} with token: {token[:10]}...")
        
        # Insert into MongoDB
        sessionsCollection.insert_one(session_data)
        
        return token

class FacebookOAuthHandler(BaseCORSHandler, tornado.auth.FacebookGraphMixin):
    async def get(self):
        redirect_uri = self.application.settings.get('facebook_redirect_base_uri', default_host + "/auth/facebook/callback")
        if self.get_argument("code", None):
            user = await self.get_authenticated_user(
                redirect_uri=redirect_uri,
                client_id=self.settings.get("facebook_oauth", {}).get("key", os.getenv("FACEBOOK_CLIENT_ID")),
                client_secret=self.settings.get("facebook_oauth", {}).get("secret", os.getenv("FACEBOOK_CLIENT_SECRET")),
                code=self.get_argument("code")
            )
            if not user:
                self.set_status(401)
                self.write({"authenticated": False})
                return
            email = user.get("email")
            if not email:
                self.redirect("/?error=email_required")
                return
            existing_user = usersCollection.find_one({"email": email})
            if not existing_user:
                usersCollection.insert_one({
                    "email": email,
                    "name": user.get("name", ""),
                    "created_at": datetime.now().isoformat(),
                    "provider": "facebook"
                })
                
                # Store Facebook OAuth info
                facebookOAuthCollection.insert_one({
                    "email": email,
                    "access_token": user.get("access_token"),
                    "expires_at": user.get("expires_in"),
                    "created_at": datetime.now().isoformat()
                })
                
            token = secrets.token_hex(32)
            expires_at = int((datetime.now() + timedelta(days=1)).timestamp() * 1000)  # 24 hours from now
            
            # Store session in MongoDB
            sessionsCollection.insert_one({
                "token": token,
                "user_id": email,
                "expires_at": expires_at,
                "created_at": datetime.now().isoformat()
            })
            
            self.redirect(f"/#/dashboard?token={token}")
        else:
            self.authorize_redirect(
                redirect_uri=redirect_uri,
                client_id=self.settings.get("facebook_oauth", {}).get("key", os.getenv("FACEBOOK_CLIENT_ID")),
                scope=["public_profile", "email"]
            )

    # Add to SignInHandler, SignUpHandler, OAuth handlers after session creation
    def create_session(self, user_id):
        # Generate a secure token
        token = secrets.token_hex(32)
        
        # Store in MongoDB with proper structure
        session_data = {
            "user_id": user_id,  # This should be the email address
            "token": token,
            "created_at": datetime.now().isoformat()
        }
        
        # Log session creation for debugging
        print(f"Creating session for user: {user_id} with token: {token[:10]}...")
        
        # Insert into MongoDB
        sessionsCollection.insert_one(session_data)
        
        return token

class AuthCheckHandler(BaseCORSHandler):
    def get(self):
        auth_header = self.request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
        
        if not token:
            self.set_status(401)
            self.write({"authenticated": False})
            return
        
        # Find session in MongoDB
        current_time = int(datetime.now().timestamp() * 1000)
        session = sessionsCollection.find_one({"token": token})
        
        if not session:
            self.set_status(401)
            self.write({"authenticated": False})
            return
        
        # Check if token has expired
        if current_time > session.get("expires_at", 0):
            # Session expired, remove it
            sessionsCollection.delete_one({"token": token})
            self.set_status(401)
            self.write({"authenticated": False})
            return
        
        user_id = session.get("user_id")
        
        # Get user from MongoDB
        user = usersCollection.find_one({"email": user_id})
        
        if not user:
            self.set_status(404)
            self.write({"authenticated": False, "message": "User not found"})
            return

        self.write({
            "authenticated": True,
            "user": {
                "email": user.get("email"),
                "name": user.get("name", "")
            }
        })

class LogoutHandler(BaseCORSHandler):
    def post(self):
        auth_header = self.request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
        
        if not token:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return
        
        # Remove session from MongoDB
        result = sessionsCollection.delete_one({"token": token})
        
        if result.deleted_count == 0:
            self.set_status(401)
            self.write({"message": "Invalid token"})
            return
            
        self.set_status(204)
        self.finish()

# Update the remaining handlers that use session tokens
class UserProfileHandler(BaseCORSHandler):
    def get(self):
        auth_header = self.request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
        
        if not token:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return
        
        # Find session in MongoDB
        session = sessionsCollection.find_one({"token": token})
        
        if not session:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return
        
        # Check if token has expired
        current_time = int(datetime.now().timestamp() * 1000)
        if current_time > session.get("expires_at", 0):
            sessionsCollection.delete_one({"token": token})
            self.set_status(401)
            self.write({"message": "Session expired"})
            return
            
        user_id = session.get("user_id")
        user = usersCollection.find_one({"email": user_id})
        
        if not user:
            self.set_status(404)
            self.write({"message": "User not found"})
            return
        
        self.write({
            "email": user.get("email"),
            "name": user.get("name", ""),
            "created_at": user.get("created_at")
        })

class UpdateProfileHandler(BaseCORSHandler):
    def post(self):
        auth_header = self.request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
        
        if not token:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return

        session = sessionsCollection.find_one({"token": token})
        if not session:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return

        # Check if token has expired
        current_time = int(datetime.now().timestamp() * 1000)
        if current_time > session.get("expires_at", 0):
            sessionsCollection.delete_one({"token": token})
            self.set_status(401)
            self.write({"message": "Session expired"})
            return

        user_id = session["user_id"]
        user = usersCollection.find_one({"email": user_id})

        if not user:
            self.set_status(404)
            self.write({"message": "User not found"})
            return
        
        try:
            data = json.loads(self.request.body)
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"message": "Invalid JSON"})
            return
        
        name = data.get("name")
        
        if name:
            usersCollection.update_one({"email": user_id}, {"$set": {"name": name}})
        if not token:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return

        session = sessionsCollection.find_one({"token": token})
        if not session:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return

        # Check if token has expired
        current_time = int(datetime.now().timestamp() * 1000)
        if current_time > session.get("expires_at", 0):
            sessionsCollection.delete_one({"token": token})
            self.set_status(401)
            self.write({"message": "Session expired"})
            return

        user_id = session["user_id"]

        # Delete user from MongoDB
        usersCollection.delete_one({"email": user_id})

        # Remove session
        sessionsCollection.delete_one({"token": token})

        self.set_status(204)
        self.finish()

class DeleteAccountHandler(BaseCORSHandler):
    def post(self):
        auth_header = self.request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
        
        if not token:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return

        # Find session in MongoDB
        session = sessionsCollection.find_one({"token": token})
        if not session:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return

        # Check if token has expired
        current_time = int(datetime.now().timestamp() * 1000)
        if current_time > session.get("expires_at", 0):
            sessionsCollection.delete_one({"token": token})
            self.set_status(401)
            self.write({"message": "Session expired"})
            return

        user_id = session.get("user_id")

        # Delete user from MongoDB
        result = usersCollection.delete_one({"email": user_id})
        
        if result.deleted_count == 0:
            self.set_status(404)
            self.write({"message": "User not found or already deleted"})
            return

        # Remove all sessions for this user
        sessionsCollection.delete_many({"user_id": user_id})

        self.set_status(200)
        self.write({"message": "Account deleted successfully"})

class ResetPasswordHandler(BaseCORSHandler):
    def post(self):
        try:
            data = json.loads(self.request.body)
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"message": "Invalid JSON"})
            return

        email = data.get("email")
        new_password = data.get("new_password")

        auth_header = self.request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""

        if not token:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return

        session = sessionsCollection.find_one({"token": token})
        if not session:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return

        # Check if token has expired
        current_time = int(datetime.now().timestamp() * 1000)
        if current_time > session.get("expires_at", 0):
            sessionsCollection.delete_one({"token": token})
            self.set_status(401)
            self.write({"message": "Session expired"})
            return

        user_id = session["user_id"]

        # Get user from MongoDB
        user = usersCollection.find_one({"email": user_id})

        if not user:
            self.set_status(404)
            self.write({"message": "User not found"})
            return
        
        # Hash the new password
        hashed_password = hashlib.sha256(new_password.encode()).hexdigest()
        # Update user password in MongoDB
        usersCollection.update_one({"email": email}, {"$set": {"password": hashed_password}})
        
        self.write({"message": "Password reset successfully"})

class ChangePasswordHandler(BaseCORSHandler):
    def post(self):
        auth_header = self.request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
        
        if not token:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return

        session = sessionsCollection.find_one({"token": token})
        if not session:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return

        # Check if token has expired
        current_time = int(datetime.now().timestamp() * 1000)
        if current_time > session.get("expires_at", 0):
            sessionsCollection.delete_one({"token": token})
            self.set_status(401)
            self.write({"message": "Session expired"})
            return

        user_id = session["user_id"]

        # Get user from MongoDB
        user = usersCollection.find_one({"email": user_id})
        if not user:
            self.set_status(404)
            self.write({"message": "User not found"})
            return

        try:
            data = json.loads(self.request.body)
        except json.JSONDecodeError:
            self.set_status(400)
            self.write({"message": "Invalid JSON"})
            return
        
        old_password = data.get("old_password")
        new_password = data.get("new_password")

        if not old_password or not new_password:
            self.set_status(400)
            self.write({"message": "Old and new passwords are required"})
            return

        hashed_old_password = hashlib.sha256(old_password.encode()).hexdigest()
        
        if hashed_old_password != user.get("password"):
            self.set_status(401)
            self.write({"message": "Old password is incorrect"})
            return

        # Hash the new password
        hashed_new_password = hashlib.sha256(new_password.encode()).hexdigest()
        
        # Update user password in MongoDB
        usersCollection.update_one({"email": user_id}, {"$set": {"password": hashed_new_password}})
        
        self.write({"message": "Password changed successfully"})

class OAuthLogoutHandler(BaseCORSHandler):
    def post(self):
        auth_header = self.request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
        
        if not token:
            self.set_status(401)
            self.write({"message": "Not authenticated"})
            return

        # Remove session from MongoDB
        result = sessionsCollection.delete_one({"token": token})
        if result.deleted_count == 0:
            self.set_status(401)
            self.write({"message": "Invalid token"})
            return

        self.set_status(204)
        self.finish()

class OAuthCallbackHandler(BaseCORSHandler):
    def get(self):
        # This handler is used for OAuth callbacks, but we don't need to do anything here
        # since the actual OAuth logic is handled in the specific OAuth handlers.
        self.set_status(200)
        self.write({"message": "OAuth callback received"})

class HealthCheckHandler(BaseCORSHandler):
    def get(self):
        # Simple health check endpoint
        self.write({"status": "ok", "timestamp": datetime.now().isoformat()})
        self.set_status(200)

class NotFoundHandler(BaseCORSHandler):
    def get(self):
        self.set_status(404)
        self.write({"message": "Not Found"})
    def post(self):
        self.set_status(404)
        self.write({"message": "Not Found"})
    def put(self):
        self.set_status(404)
        self.write({"message": "Not Found"})
    def delete(self):
        self.set_status(404)
        self.write({"message": "Not Found"})
    def options(self):
        self.set_status(404)
        self.write({"message": "Not Found"})
    def patch(self):
        self.set_status(404)
        self.write({"message": "Not Found"})
    def head(self):
        self.set_status(404)
        self.write({"message": "Not Found"})
    def trace(self):
        self.set_status(404)
        self.write({"message": "Not Found"})
    def connect(self):
        self.set_status(404)
        self.write({"message": "Not Found"})

class ErrorHandler(BaseCORSHandler):
    def write_error(self, status_code, **kwargs):
        self.set_status(status_code)
        if "exc_info" in kwargs:
            exc = kwargs["exc_info"][1]
            self.write({"error": str(exc)})
        else:
            self.write({"error": "An error occurred"})
    def get(self):
        self.set_status(500)
        self.write({"error": "Internal Server Error"})
    def post(self):
        self.set_status(500)
        self.write({"error": "Internal Server Error"})
    def put(self):
        self.set_status(500)
        self.write({"error": "Internal Server Error"})
    def delete(self):
        self.set_status(500)
        self.write({"error": "Internal Server Error"})
    def options(self):
        self.set_status(500)
        self.write({"error": "Internal Server Error"})
    def patch(self):
        self.set_status(500)
        self.write({"error": "Internal Server Error"})
    def head(self):
        self.set_status(500)
        self.write({"error": "Internal Server Error"})
    def trace(self):
        self.set_status(500)
        self.write({"error": "Internal Server Error"})
    def connect(self):
        self.set_status(500)
        self.write({"error": "Internal Server Error"})

# This code is a simple Tornado web application that provides authentication and user management features.
# It includes handlers for signing in, signing up, OAuth login, checking authentication status,
# updating profiles, deleting accounts, resetting passwords, and changing passwords.
# It also includes CORS support, health check endpoints, and error handling.
# The application uses in-memory storage for users and sessions, which is not suitable for production.
# In a real application, you would use a database to store user data and sessions.
# The OAuth handlers use Google and Facebook for authentication, and the application supports both
#OAuth and traditional email/password authentication.
# The application is designed to run on localhost at port 4040, and it allows cross-origin requests from specific origins.
# The code is structured to handle various HTTP methods and provides appropriate responses for each endpoint.
# Note: This code is for demonstration purposes and should not be used as-is in production.
# Always ensure to implement proper security measures, such as password hashing, input validation,
# and secure session management when building a real application.
# The code also includes a NotFoundHandler to handle 404 errors and an ErrorHandler to handle other errors.
# The handlers are designed to be reusable and can be extended or modified as needed.
# The application is built using the Tornado web framework, which is known for its high performance and scalability.
# The code is modular and can be easily integrated into a larger application or modified to fit specific requirements.
# The application is designed to be extensible, allowing for the addition of new features or modifications to existing ones.
# The use of environment variables for configuration (e.g., OAuth keys) allows for easy deployment in different environments.