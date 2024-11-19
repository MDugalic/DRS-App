from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:qwer@localhost/drs_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

@app.route('/check_connection')
def check_connection():
    try:
        db.session.execute(text('SELECT 1'))
        return "W"
    except Exception as e:
        return f"L {str(e)}"

@app.route("/members")
def members():
    return {"memebrs": ["element-1", "element-2"]}

if __name__ == "__main__":
    app.run(debug=True)