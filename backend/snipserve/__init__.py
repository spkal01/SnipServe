from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from snipserve import config
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = config.SQLALCHEMY_DATABASE_URI
app.config['SECRET_KEY'] = config.SECRET_KEY
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for frontend communication
CORS(app, supports_credentials=True, origins=['http://localhost:5001', 'http://localhost:4174', 'http://localhost:5173'])

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.init_app(app)
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)

# Import routes after creating app and db to avoid circular imports
from snipserve import routes
# Import models after creating app and db to ensure they are registered
from snipserve import models