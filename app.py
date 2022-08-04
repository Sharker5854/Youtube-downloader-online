from flask import Flask
from flask import request, render_template

app = Flask(__name__)


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/install/", methods=["POST"])
def install_video():
    return "INSTALLING..."


if __name__ == "__main__":
    app.run(debug=True, port=8000)