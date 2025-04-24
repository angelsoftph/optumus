from flask import Flask, request, jsonify  # type: ignore
from flask_cors import CORS, cross_origin # type: ignore
from flask_mysqldb import MySQL # type: ignore
from MySQLdb.cursors import DictCursor # type: ignore
from flask_bcrypt import Bcrypt # type: ignore
from flask_jwt_extended import ( # type: ignore
    create_access_token, create_refresh_token, get_jwt_identity,
    JWTManager, jwt_required, set_refresh_cookies, unset_jwt_cookies
)
from config import Config
from datetime import datetime, timedelta
from dotenv import load_dotenv # type: ignore
import boto3 # type: ignore
import jwt # type: ignore
import os
import pusher # type: ignore
import uuid
from werkzeug.utils import secure_filename # type: ignore

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
app.config.from_object(Config)
app.config['DEBUG'] = os.getenv('DEBUG') == 'True'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)

mysql = MySQL(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

S3_BASE_URL = f"https://{app.config['AWS_BUCKET']}.s3.{app.config['AWS_REGION']}.amazonaws.com"
s3 = boto3.client("s3",
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY")
)

pusher_client = pusher.Pusher(
    app_id=app.config['PUSHER_APP_ID'],
    key=app.config['PUSHER_APP_KEY'],
    secret=app.config['PUSHER_APP_SECRET'],
    cluster=app.config['PUSHER_APP_CLUSTER'],
    ssl=True
)

@app.route('/api/register', methods=['POST'])
def register():
    fullname = request.form.get('fullname')
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
    usertype = 'R'

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    photo_url = None
    if 'photo' in request.files:
        photo = request.files['photo']
        if photo and photo.filename != '':
            filename = secure_filename(photo.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            try:
                s3.upload_fileobj(
                    photo,
                    app.config['AWS_BUCKET'],
                    unique_filename,
                    ExtraArgs={"ACL": "public-read", "ContentType": photo.content_type}
                )
                photo_url = f"{S3_BASE_URL}/{unique_filename}"
            except Exception as e:
                return jsonify({"error": f"Failed to upload image: {str(e)}"}), 500

    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cur.fetchone()

        if existing_user:
            return jsonify({"error": "User already exists"}), 409

        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        cur.execute(
            "INSERT INTO users (fullname, username, email, password, usertype, photo) " \
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (fullname, username, email, hashed_pw, usertype, photo_url)
        )
        mysql.connection.commit()
        cur.close()

        user_id = cur.lastrowid
        access_token = create_access_token(identity=str(user_id))

        return jsonify({
            "message": "User registered successfully",
            "token": access_token,
            "user": {
                "fullname": fullname,
                "username": username,
                "email": email,
                "photo": photo_url
            }
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    row = cur.fetchone()

    if row:
        column_names = [desc[0] for desc in cur.description]
        user_data = dict(zip(column_names, row))
        cur.close()
    else:
        cur.close()
        return jsonify({"error": "Invalid credentials"}), 401

    if bcrypt.check_password_hash(user_data['password'], password):
        access_token = create_access_token(identity=str(user_data['id']))
        refresh_token = create_refresh_token(identity=str(user_data['id']))

        user_data.pop('password', None)
        user_data.pop('created_at', None)
        user_data.pop('updated_at', None)

        response = jsonify({
            "token": access_token,
            "data": user_data
        })

        set_refresh_cookies(response, refresh_token)

        return response, 200

    return jsonify({"error": "Invalid credentials"}), 401


@app.route('/api/create-book', methods=['POST'])
def create_book():
    data = request.form
    title = data.get('title')
    author = data.get('author')
    content = data.get('content')
    category_id = data.get('category_id')
    status = "A"

    if not title or not author:
        return jsonify({"error": "Title and author required"}), 400

    photo_url = None
    if 'photo' in request.files:
        photo = request.files['photo']
        if photo and photo.filename != '':
            filename = secure_filename(photo.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            try:
                s3.upload_fileobj(
                    photo,
                    app.config['AWS_BUCKET'],
                    f"books/{unique_filename}",
                    ExtraArgs={"ACL": "public-read", "ContentType": photo.content_type}
                )
                photo_url = f"{S3_BASE_URL}/books/{unique_filename}"
            except Exception as e:
                return jsonify({"error": f"Failed to upload image: {str(e)}"}), 500

    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM books WHERE title = %s", (title,))
        existing_book = cur.fetchone()

        if existing_book:
            return jsonify({"error": "Book already exists"}), 409

        cur.execute(
            "INSERT INTO books (title, author, content, category_id, photo, status) " \
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (title, author, content, category_id, photo_url, status)
        )
        mysql.connection.commit()
        cur.close()

        new_book_id = cur.lastrowid
        return jsonify({'status': 'Book successfully created', 'id': new_book_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()


@app.route('/api/logout', methods=['POST'])
def logout():
    response = jsonify({'message': 'Logout successful'})
    unset_jwt_cookies(response)
    return response, 200

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, fullname, username, email, created_at FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
    cur.close()

    if user:
        return jsonify({"id": user[0], "username": user[1], "joined": user[2]}), 200
    return jsonify({"error": "User not found"}), 404

@app.route("/pusher/auth", methods=["POST", "OPTIONS"])
@cross_origin(origins=app.config['FRONTEND_URL'], supports_credentials=True)
def pusher_auth():
    socket_id = request.form.get("socket_id")
    channel_name = request.form.get("channel_name")

    if not socket_id or not channel_name:
        return jsonify({'error': 'Missing socket_id or channel_name'}), 400

    auth = pusher_client.authenticate(
        channel=channel_name,
        socket_id=socket_id
    )
    return jsonify(auth)


@app.route('/api/borrow-book', methods=['POST'])
@cross_origin(origins=app.config['FRONTEND_URL'], supports_credentials=True)
@jwt_required()
def borrow_book():
    book_id = request.args.get("book_id")
    user_id = int(get_jwt_identity())

    cur = None
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        existing_book = cur.fetchone()

        if not existing_book:
            return jsonify({"error": "Book does not exist"}), 409

        cur.execute(
            "INSERT INTO borrowers (book_id, user_id) VALUES (%s, %s)",
            (book_id, user_id)
        )

        cur.execute(
            "UPDATE books SET status = %s WHERE id = %s",
            ("U", book_id)
        )

        mysql.connection.commit()

        return jsonify({'status': 'Book successfully loaned'}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cur:
            cur.close()


@app.route('/api/return-book', methods=['POST'])
@cross_origin(origins=app.config['FRONTEND_URL'], supports_credentials=True)
@jwt_required()
def return_book():
    book_id = request.args.get("book_id")
    user_id = int(get_jwt_identity())

    if not book_id:
        return jsonify({"error": "Missing book_id"}), 400

    cur = None
    try:
        cur = mysql.connection.cursor()

        # Check if the book exists
        cur.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        existing_book = cur.fetchone()

        if not existing_book:
            return jsonify({"error": "Book does not exist"}), 404

        # Check if the book was borrowed by this user
        cur.execute(
            "SELECT * FROM borrowers WHERE user_id = %s AND book_id = %s",
            (user_id, book_id)
        )
        borrowed_book = cur.fetchone()

        if not borrowed_book:
            return jsonify({"error": "Current user does not possess this book"}), 403

        # Update loan status to returned
        cur.execute(
            "UPDATE borrowers SET status = %s WHERE id = %s",
            ("R", borrowed_book[0])
        )

        # Update book status to available
        cur.execute(
            "UPDATE books SET status = %s WHERE id = %s",
            ("A", book_id)
        )

        mysql.connection.commit()

        return jsonify({'status': 'Book successfully returned'}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cur:
            cur.close()


@app.route('/api/show-book', methods=['GET'])
def show_book():
    book_id = request.args.get("id")

    cur = mysql.connection.cursor()

    sql = """
        SELECT
            b.title,
            b.author,
            b.content,
            b.category_id,
            c.name AS category_name,
            b.status,
            u.fullname AS borrower_name
        FROM books b
            JOIN categories c ON b.category_id = c.id
            JOIN borrowers ON b.id = borrowers.book_id
            JOIN users u ON u.id = borrowers.user_id;
        WHERE id = %s
    """

    cur.execute(sql, (book_id,))
    book = cur.fetchone()
    cur.close()

    if book:
        return jsonify({
            "title": book[0],
            "author": book[1],
            "content": book[2],
            "category_id": book[3]
        }), 200

    return jsonify({"error": "Book not found"}), 404


@cross_origin(origins=app.config['FRONTEND_URL'], supports_credentials=True)
@app.route('/api/show-books', methods=['GET'])
def show_books():
    try:
        limit = int(request.args.get('limit', 10))
        offset = int(request.args.get('offset', 0))

        cur = mysql.connection.cursor()

        cur.execute("SELECT COUNT(*) FROM books")
        total = cur.fetchone()[0]

        sql = """
            SELECT 
                books.id, 
                books.title, 
                books.author, 
                books.content, 
                books.photo, 
                books.category_id, 
                categories.name AS category_name, 
                books.status
            FROM books
                JOIN categories ON books.category_id = categories.id
                ORDER BY books.id
            LIMIT %s OFFSET %s;
        """
        cur.execute(sql, (limit, offset))
        rows = cur.fetchall()
        column_names = [desc[0] for desc in cur.description]

        books = [dict(zip(column_names, row)) for row in rows]

        return jsonify({
            "books": books,
            "limit": limit,
            "offset": offset,
            "total": total
        }), 200

    except Exception as err:
        return jsonify({'error': str(err)}), 500

    finally:
        cur.close()


@cross_origin(origins=app.config['FRONTEND_URL'], supports_credentials=True)
@app.route('/api/user-history', methods=['GET'])
@jwt_required()
def user_history():
    user_id = int(get_jwt_identity())
    cur = None

    try:
        try:
            limit = int(request.args.get('limit', 10))
            offset = int(request.args.get('offset', 0))
            status = request.args.get('status')
        except ValueError:
            return jsonify({"error": "Invalid limit or offset"}), 400

        cur = mysql.connection.cursor()

        count_sql = "SELECT COUNT(*) FROM borrowers WHERE user_id = %s"
        count_params = [user_id]

        if status != 'U':
            count_sql += " AND status IS NOT NULL"

        cur.execute(count_sql, tuple(count_params))
        total = cur.fetchone()[0]

        base_sql = """
            SELECT
                b.id,
                b.title,
                b.author,
                b.photo,
                b.category_id,
                c.name AS category_name,
                b.status,
                w.created_at AS loan_date,
                w.updated_at AS return_date
            FROM books b
                JOIN categories c ON b.category_id = c.id
                JOIN borrowers w ON b.id = w.book_id
                JOIN users u ON u.id = w.user_id
            WHERE u.id = %s
        """

        params = [user_id]

        if status == 'U':
            base_sql += " AND b.status = %s AND w.status IS NULL"
            params.append('U')
        else:
            base_sql += " AND w.status IS NOT NULL"

        base_sql += " ORDER BY b.id LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        cur.execute(base_sql, tuple(params))
        rows = cur.fetchall()
        column_names = [desc[0] for desc in cur.description]

        history = [dict(zip(column_names, row)) for row in rows]

        return jsonify({
            "history": history,
            "limit": limit,
            "offset": offset,
            "total": total
        }), 200

    except Exception as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if cur:
            cur.close()


@app.route('/api/get-users', methods=['GET'])
def get_users():
    try:
        limit = int(request.args.get('limit', 10))
        offset = int(request.args.get('offset', 0))

        cur = mysql.connection.cursor()

        cur.execute("SELECT COUNT(*) FROM users")
        total = cur.fetchone()[0]

        sql = """
            SELECT 
                fullname,
                username,
                usertype,
                email,
                photo
            FROM users
            WHERE usertype = 'R'
            LIMIT %s OFFSET %s;
        """
        cur.execute(sql, (limit, offset))
        rows = cur.fetchall()
        column_names = [desc[0] for desc in cur.description]

        users = [dict(zip(column_names, row)) for row in rows]

        return jsonify({
            "users": users,
            "limit": limit,
            "offset": offset,
            "total": total
        }), 200

    except Exception as err:
        return jsonify({'error': str(err)}), 500

    finally:
        cur.close()


@app.route('/api/create-message', methods=['POST'])
@jwt_required()
def create_message():
    data = request.json

    sender_id = int(get_jwt_identity())
    recipient_id = int(data.get('recipient_id'))
    message = data.get('message')

    if not message or not recipient_id:
        return jsonify({'error': 'Message and recipient_id are required'}), 400

    try:
        cur = mysql.connection.cursor()

        cur.execute(
            """
            INSERT INTO messages (message, sender_id, recipient_id, is_read, is_deleted)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (message, sender_id, recipient_id, 0, 0)
        )
        mysql.connection.commit()
        message_id = cur.lastrowid

    except Exception as err:
        return jsonify({'error': str(err)}), 500

    finally:
        cur.close()

    return jsonify({
        'status': 'Message successfully created',
        'message_id': message_id,
        'message': message,
        'recipient_id': recipient_id,
        'sender_id': sender_id
    }), 200


@app.route('/api/send-message', methods=['POST'])
@cross_origin(origins=app.config['FRONTEND_URL'], supports_credentials=True)
@jwt_required()
def send_message():
    try:
        current_datetime = datetime.now()
        formatted_datetime = current_datetime.strftime('%Y-%m-%d %H:%M:%S')
        data = request.get_json()

        print("send_message payload:", data)

        sender_id = int(get_jwt_identity())
        recipient_id = int(data['recipient_id'])
        low, high = sorted([sender_id, recipient_id])
        channel_name = f"private-channel-{low}-{high}"

        message_data = {
            'id': data['id'],
            'sender_id': sender_id,
            'recipient_id': recipient_id,
            'message': data['message'],
            'created_at': formatted_datetime
        }

        pusher_client.trigger(channel_name, 'new-message', message_data)

        return jsonify({'status': 'Message successfully sent', 'message': message_data}), 200

    except Exception as e:
        print("Error in /api/send-message:", str(e))
        return jsonify({'error': str(e)}), 500


@app.route('/api/get-threads', methods=['GET', 'OPTIONS'])
@cross_origin(origins=app.config['FRONTEND_URL'], supports_credentials=True)
@jwt_required()
def get_threads():
    user_id = int(get_jwt_identity())

    cur = None
    try:
        cur = mysql.connection.cursor(DictCursor)

        sql = """
            SELECT
                m1.id AS message_id,
                m1.sender_id,
                m1.recipient_id,
                m1.message AS last_message,
                m1.created_at,
                IF(m1.sender_id = %s, m1.recipient_id, m1.sender_id) AS other_user_id,
                u.id AS user_id,
                u.fullname,
                u.username,
                u.photo
            FROM messages m1
            INNER JOIN (
                SELECT
                    LEAST(sender_id, recipient_id) AS user1,
                    GREATEST(sender_id, recipient_id) AS user2,
                    MAX(created_at) AS max_created
                FROM messages
                WHERE (sender_id = %s OR recipient_id = %s)
                  AND (is_deleted IS NULL OR is_deleted = 0)
                GROUP BY user1, user2
            ) grouped
                ON LEAST(m1.sender_id, m1.recipient_id) = grouped.user1
                AND GREATEST(m1.sender_id, m1.recipient_id) = grouped.user2
                AND m1.created_at = grouped.max_created
            INNER JOIN users u ON u.id = IF(m1.sender_id = %s, m1.recipient_id, m1.sender_id)
            WHERE (m1.is_deleted IS NULL OR m1.is_deleted = 0)
            ORDER BY m1.created_at DESC
        """

        cur.execute(sql, (user_id, user_id, user_id, user_id))
        results = cur.fetchall()

        threads = []
        for row in results:
            threads.append({
                "user1": user_id,
                "user2": {
                    "id": row["user_id"],
                    "fullname": row["fullname"],
                    "username": row["username"],
                    "photo": row['photo']
                },
                "last_message": row["last_message"],
                "created_at": row["created_at"].strftime('%Y-%m-%d %H:%M:%S')
            })

        return jsonify(threads), 200

    except Exception as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if cur:
            cur.close()


@app.route('/api/get-convo', methods=['GET'])
@jwt_required()
def get_conversation():
    user_id = int(get_jwt_identity())
    recipient_id = request.args.get('recipient_id')

    if not recipient_id:
        return jsonify({'error': 'Missing recipient_id'}), 400

    try:
        cur = mysql.connection.cursor()

        sql = """
            SELECT id, sender_id, recipient_id, message, is_read, is_deleted, created_at
            FROM messages
            WHERE (sender_id = %s AND recipient_id = %s)
               OR (sender_id = %s AND recipient_id = %s)
            ORDER BY created_at ASC
        """
        cur.execute(sql, (user_id, recipient_id, recipient_id, user_id))
        rows = cur.fetchall()
        column_names = [desc[0] for desc in cur.description]

        conversation_id = f"conversation_{min(int(user_id), int(recipient_id))}_{max(int(user_id), int(recipient_id))}"

        messages = []
        for row in rows:
            message = dict(zip(column_names, row))
            message['conversation_id'] = conversation_id

            if isinstance(message['created_at'], datetime):
                message['created_at'] = message['created_at'].strftime("%a, %d %b %Y %H:%M:%S GMT")
            messages.append(message)

        return jsonify(messages), 200

    except Exception as err:
        return jsonify({'error': str(err)}), 500

    finally:
        cur.close()


@app.route('/api/loan-history', methods=['GET'])
@cross_origin(origins=app.config['FRONTEND_URL'], supports_credentials=True)
def loan_history():
    cur = None

    try:
        try:
            limit = int(request.args.get('limit', 10))
            offset = int(request.args.get('offset', 0))
        except ValueError:
            return jsonify({"error": "Invalid limit or offset"}), 400

        cur = mysql.connection.cursor()

        count_sql = "SELECT COUNT(*) FROM borrowers"
        cur.execute(count_sql)
        total = cur.fetchone()[0]

        sql = """
            SELECT w.id, u.fullname, u.email, b.id AS book_id, b.title, b.author,
            c.id AS category_id, c.name AS category_name, b.photo, w.created_at,
            w.updated_at, w.status
            FROM borrowers w
            JOIN users u ON w.user_id = u.id
            JOIN books b ON w.book_id = b.id
            JOIN categories c ON b.category_id = c.id
            ORDER BY w.id DESC
            LIMIT %s OFFSET %s
        """

        cur.execute(sql, (limit, offset))
        rows = cur.fetchall()
        column_names = [desc[0] for desc in cur.description]
        history = [dict(zip(column_names, row)) for row in rows]

        return jsonify({
            "history": history,
            "limit": limit,
            "offset": offset,
            "total": total
        }), 200

    except Exception as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if cur:
            cur.close()


def get_user_id_from_token():
    auth_header = request.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
        return decoded.get("sub")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/')
def index():
    return "Optumus Backend running!"

if __name__ == '__main__':
    app.run(debug=True)
