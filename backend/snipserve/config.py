from dotenv import load_dotenv
import os
# Load environment variables from .env file
load_dotenv()

# Construct DATABASE_URL for PostgreSQL
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///pastebin.db')
SQLALCHEMY_DATABASE_URI = DATABASE_URL
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
INVITE_CODE = os.environ.get('INVITE_CODE', 'test')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')