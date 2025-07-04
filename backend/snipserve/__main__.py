from snipserve import app, db
from snipserve.models import Paste  # Explicitly import models to ensure they're registered

if __name__ == '__main__':
    app.run()