from dotenv import load_dotenv # type: ignore
import os

class Config:
    FRONTEND_URL = os.getenv('FRONTEND_URL')
    MYSQL_HOST = os.getenv('MYSQL_HOST')
    MYSQL_USER = os.getenv('MYSQL_USER')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
    MYSQL_DB = os.getenv('MYSQL_DB')
    PUSHER_APP_ID = os.getenv('PUSHER_APP_ID')
    PUSHER_APP_KEY = os.getenv('PUSHER_APP_KEY')
    PUSHER_APP_SECRET = os.getenv('PUSHER_APP_SECRET')
    PUSHER_APP_CLUSTER = os.getenv('PUSHER_APP_CLUSTER')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.getenv('AWS_REGION')
    AWS_BUCKET = os.getenv('AWS_BUCKET')
    AWS_URL = os.getenv('AWS_URL')
    AWS_USE_PATH_STYLE_ENDPOINT=False