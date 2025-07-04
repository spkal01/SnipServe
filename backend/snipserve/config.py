from dotenv import load_dotenv
import os
# Load environment variables from .env file
load_dotenv()

# Database Configuration
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_NAME = os.environ.get('DB_NAME', 'pastebin')
DB_USER = os.environ.get('DB_USER', 'pasteuser')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'pastepass')

# Construct DATABASE_URL for PostgreSQL
DATABASE_URL = os.environ.get('DATABASE_URL') or \
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

SQLALCHEMY_DATABASE_URI = DATABASE_URL
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
INVITE_CODE = os.environ.get('INVITE_CODE', 'test')