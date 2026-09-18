import os
from datetime import date, datetime
from functools import wraps

from flask import Flask, flash, jsonify, redirect, render_template, request, session, url_for

try:
    from supabase import create_client
except ImportError:
    create_client = None

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = os.getenv("FLASK_SECRET_KEY", "change-me-in-production")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if create_client and SUPABASE_URL and SUPABASE_KEY else None

PLATFORMS = ["Facebook", "Instagram", "TikTok", "YouTube", "X", "LinkedIn", "Google"]
FORMATS = ["Reel", "Carousel", "Photo", "Story", "Video", "Text"]

def current_user():
    return session.get("user")

def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not current_user():
            return redirect(url_for("auth"))
        return view(*args, **kwargs)
    return wrapped

def db_select(table, order=None, limit=None):
    if not supabase or not current_user():
        return []
    q = supabase.table(table).select("*").eq("user_id", current_user()["id"])
    if order:
        q = q.order(order, desc=True)
    if limit:
        q = q.limit(limit)
    return q.execute().data or []

def db_insert(table, values):
    if not supabase:
        raise RuntimeError("Supabase is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.")
    values = {**values, "user_id": current_user()["id"]}
    return supabase.table(table).insert(values).execute().data

def db_delete(table, row_id):
    if supabase:
        supabase.table(table).delete().eq("id", row_id).eq("user_id", current_user()["id"]).execute()

@app.context_processor
def inject_globals():
    return {"user": current_user(), "platforms": PLATFORMS}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/auth", methods=["GET", "POST"])
def auth():
    if request.method == "POST":
        mode = request.form.get("mode", "signin")
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        full_name = request.form.get("full_name", "").strip()
        try:
            if not supabase:
                raise RuntimeError("Supabase is not configured.")
            if mode == "signup":
                result = supabase.auth.sign_up({
                    "email": email,
                    "password": password,
                    "options": {"data": {"full_name": full_name}},
                })
                if not result.user:
                    raise RuntimeError("Account could not be created.")
                if not result.session:
                    flash("Check your email to confirm your account, then sign in.", "success")
                    return render_template("auth.html", check_email=True, email=email)
            else:
                result = supabase.auth.sign_in_with_password({"email": email, "password": password})
            if result.session and result.user:
                session["user"] = {"id": str(result.user.id), "email": result.user.email, "full_name": (result.user.user_metadata or {}).get("full_name", "")}
                return redirect(url_for("dashboard"))
            raise RuntimeError("Authentication did not return a session.")
        except Exception as exc:
            flash(str(exc), "error")
    return render_template("auth.html", check_email=False, email=request.form.get("email", ""))

@app.route("/logout")
def logout():
    if supabase:
        try:
            supabase.auth.sign_out()
        except Exception:
            pass
    session.clear()
    return redirect(url_for("index"))

@app.route("/dashboard")
@login_required
def dashboard():
    business = (db_select("businesses", "created_at", 1) or [None])[0]
    return render_template("dashboard.html", business=business)

@app.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    existing = (db_select("businesses", "created_at", 1) or [None])[0]
    if request.method == "POST":
        values = {
            "name": request.form.get("name", "").strip(),
            "industry": request.form.get("industry", "").strip(),
            "location": request.form.get("location", "").strip(),
            "audience": request.form.get("audience", "").strip(),
            "goals": request.form.get("goals", "").strip(),
            "monthly_budget": float(request.form.get("monthly_budget") or 0) or None,
            "platforms": request.form.getlist("platforms"),
        }
        try:
            if existing and supabase:
                supabase.table("businesses").update(values).eq("id", existing["id"]).eq("user_id", current_user()["id"]).execute()
            else:
                db_insert("businesses", values)
            flash("Business profile saved.", "success")
            return redirect(url_for("dashboard"))
        except Exception as exc:
            flash(str(exc), "error")
    return render_template("profile.html", business=existing)

@app.route("/engagement", methods=["GET", "POST"])
@login_required
def engagement():
    if request.method == "POST":
        try:
            db_insert("posts", {
                "title": request.form.get("title", "").strip(),
                "platform": request.form.get("platform", "Facebook"),
                "format": request.form.get("format", "Photo"),
                "posted_at": request.form.get("posted_at") or date.today().isoformat(),
                "reach": int(request.form.get("reach") or 0),
                "likes": int(request.form.get("likes") or 0),
                "comments": int(request.form.get("comments") or 0),
                "shares": int(request.form.get("shares") or 0),
            })
            flash("Post added.", "success")
        except Exception as exc:
            flash(str(exc), "error")
        return redirect(url_for("engagement"))
    posts = db_select("posts", "posted_at")
    for p in posts:
        p["rate"] = ((p["likes"] + p["comments"] + p["shares"]) / p["reach"] * 100) if p["reach"] else 0
    average = sum(p["rate"] for p in posts) / len(posts) if posts else 0
    total_reach = sum(p["reach"] for p in posts)
    best = max(posts, key=lambda p: p["rate"]) if posts else None
    return render_template("engagement.html", posts=posts, formats=FORMATS, average=average, total_reach=total_reach, best=best)

@app.post("/engagement/<row_id>/delete")
@login_required
def delete_post(row_id):
    db_delete("posts", row_id)
    return redirect(url_for("engagement"))

@app.route("/growth")
@login_required
def growth():
    snapshots = db_select("growth_snapshots", "period")
    return render_template("placeholder.html", title="Growth tracking", subtitle="Record followers, reach and leads regularly.", message="Your growth tracking area is ready for data entry. The same Supabase table used by the original app is preserved.")

@app.route("/planner")
@login_required
def planner():
    return render_template("placeholder.html", title="Content planner", subtitle="Build a simple posting calendar with ideas and captions.", message="Content planning is mapped to the content_items table from the original repository.")

@app.route("/strategy")
@login_required
def strategy():
    return render_template("placeholder.html", title="Strategy & ads", subtitle="Turn your goals and budget into a clear plan and ad ideas.", message="Strategy and paid campaigns are mapped to the strategies and ad_campaigns tables.")

@app.route("/audit")
@login_required
def audit():
    return render_template("placeholder.html", title="Brand awareness audit", subtitle="Assess how visible your brand is and identify next steps.", message="Audit records are preserved in the audits table.")

@app.route("/assistant", methods=["GET", "POST"])
@login_required
def assistant():
    if request.method == "POST":
        question = request.form.get("question", "").strip()
        answer = "I’m your Hiraya Marketing assistant. Connect an AI provider in the environment variables to enable generated answers."
        api_key = os.getenv("OPENAI_API_KEY")
        if question and api_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=api_key)
                response = client.responses.create(model=os.getenv("HIRAYA_MODEL", "gpt-5-mini"), input=f"You are Hiraya Marketing, a practical marketing assistant for small businesses. Answer concisely.\n\nUser: {question}")
                answer = response.output_text
            except Exception as exc:
                answer = f"AI request failed: {exc}"
        return render_template("assistant.html", answer=answer, question=question)
    return render_template("assistant.html", answer=None, question="")

@app.errorhandler(404)
def not_found(_):
    return render_template("404.html"), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG") == "1")
