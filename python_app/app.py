import os
from datetime import date, datetime
from functools import wraps

from flask import Flask, flash, g, jsonify, redirect, render_template, request, session, url_for, send_from_directory

try:
    from supabase import create_client
except ImportError:
    create_client = None

app = Flask(__name__, template_folder="templates", static_folder="static")
_secret_key = (os.getenv("FLASK_SECRET_KEY") or "").strip()
if not _secret_key:
    raise RuntimeError(
        "FLASK_SECRET_KEY is not set. Set a long random value in the environment before starting the app."
    )
app.secret_key = _secret_key

GENERIC_ERROR = "Something went wrong. Please try again."
AUTH_ERROR = "We could not sign you in. Check your details and try again."


def log_exception(where, exc):
    app.logger.error("%s failed: %s", where, exc, exc_info=True)

SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").strip().rstrip("/")
# Support the current Supabase publishable key plus legacy deployment names.
SUPABASE_KEY = (
    os.getenv("SUPABASE_PUBLISHABLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_KEY")
    or ""
).strip()

def build_supabase_client():
    if not create_client or not SUPABASE_URL or not SUPABASE_KEY:
        return None
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception:
        return None

def get_supabase():
    """Return a per-request Supabase client.

    A single shared client would keep one global auth session, so a sign-in or
    sign-out by one visitor would change the identity used by other requests.
    """
    client = getattr(g, "_supabase_client", None)
    if client is None:
        client = build_supabase_client()
        g._supabase_client = client
    return client

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
    if not get_supabase() or not current_user():
        return []
    client = get_supabase()
    q = client.table(table).select("*").eq("user_id", current_user()["id"])
    if order:
        q = q.order(order, desc=True)
    if limit:
        q = q.limit(limit)
    return q.execute().data or []

def db_insert(table, values):
    if not get_supabase():
        raise RuntimeError("Supabase is not configured. Render must define SUPABASE_URL and one of SUPABASE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY, or SUPABASE_KEY.")
    values = {**values, "user_id": current_user()["id"]}
    return get_supabase().table(table).insert(values).execute().data

def db_delete(table, row_id):
    if get_supabase():
        get_supabase().table(table).delete().eq("id", row_id).eq("user_id", current_user()["id"]).execute()

@app.context_processor
def inject_globals():
    return {"user": current_user(), "platforms": PLATFORMS, "today": date.today().isoformat()}

@app.route("/hero-shop.jpg")
def hero_shop():
    return send_from_directory(os.path.join(os.path.dirname(__file__), "..", "src", "assets"), "hero-shop.jpg")

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
            if not get_supabase():
                raise RuntimeError("Supabase is not configured. Render must define SUPABASE_URL and one of SUPABASE_PUBLISHABLE_KEY, SUPABASE_ANON_KEY, or SUPABASE_KEY.")
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
            log_exception("auth", exc)
            flash(AUTH_ERROR, "error")
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
            if existing and get_supabase():
                get_supabase().table("businesses").update(values).eq("id", existing["id"]).eq("user_id", current_user()["id"]).execute()
            else:
                db_insert("businesses", values)
            flash("Business profile saved.", "success")
            return redirect(url_for("dashboard"))
        except Exception as exc:
            log_exception("request", exc)
            flash(GENERIC_ERROR, "error")
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
            log_exception("request", exc)
            flash(GENERIC_ERROR, "error")
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


def business_brief():
    b = (db_select("businesses", "created_at", 1) or [None])[0] or {}
    return {"name":b.get("name","this business"),"industry":b.get("industry",""),"location":b.get("location",""),"audience":b.get("audience",""),"goals":b.get("goals",""),"monthly_budget":b.get("monthly_budget",""),"platforms":b.get("platforms",[])}

def ai_json(prompt, fallback):
    key=os.getenv("OPENAI_API_KEY")
    if not key: return fallback
    try:
        import json
        from openai import OpenAI
        response=OpenAI(api_key=key).responses.create(model=os.getenv("HIRAYA_MODEL","gpt-5-mini"),input=prompt,text={"format":{"type":"json_object"}})
        return json.loads(response.output_text)
    except Exception:
        return fallback

@app.route("/growth", methods=["GET","POST"])
@login_required
def growth():
    if request.method=="POST":
        try:
            db_insert("growth_snapshots",{"period":request.form.get("period") or date.today().isoformat(),"platform":request.form.get("platform","Facebook"),"followers":int(request.form.get("followers") or 0),"reach":int(request.form.get("reach") or 0),"leads":int(request.form.get("leads") or 0)})
            flash("Growth snapshot saved.","success")
        except Exception as exc:
            log_exception("request", exc); flash(GENERIC_ERROR, "error")
        return redirect(url_for("growth"))
    return render_template("growth.html",snapshots=db_select("growth_snapshots","period"))

@app.post("/growth/<row_id>/delete")
@login_required
def delete_growth(row_id):
    db_delete("growth_snapshots",row_id); return redirect(url_for("growth"))

@app.route("/planner", methods=["GET","POST"])
@login_required
def planner():
    if request.method=="POST":
        if request.form.get("action")=="generate":
            import json
            b=business_brief(); days=max(1,min(int(request.form.get("days") or 7),30)); start=request.form.get("start_date") or date.today().isoformat(); focus=request.form.get("focus","").strip(); plats=b["platforms"] or ["Facebook"]
            fallback={"theme":"Consistent, useful content","items":[{"platform":plats[i%len(plats)],"dayOffset":i,"theme":["Educational tip","Behind the scenes","Customer story","Product highlight","FAQ","Offer"][i%6],"caption":f"Share one helpful idea about {b['industry'] or 'your business'} and invite customers to respond.","hashtags":"#SmallBusiness #HirayaMarketing"} for i in range(min(6,days))]}
            generated=ai_json(f"""You are Hiraya, a practical digital marketing consultant for small businesses. Business: {b}. Create a {days}-day social content plan starting {start}. Focus: {focus or 'general growth'}. Return JSON with theme and items. Each item needs platform, dayOffset, theme, caption <=320 characters, hashtags. Use only: {plats}.""",fallback)
            return render_template("planner.html",items=None,generated=generated,start_date=start,days=days,focus=focus)
        try:
            db_insert("content_items",{"platform":request.form.get("platform","Facebook"),"scheduled_date":request.form.get("scheduled_date") or date.today().isoformat(),"theme":request.form.get("theme","").strip(),"caption":request.form.get("caption","").strip(),"hashtags":request.form.get("hashtags","").strip(),"status":request.form.get("status","idea")})
            flash("Content item saved.","success")
        except Exception as exc:
            log_exception("request", exc); flash(GENERIC_ERROR, "error")
        return redirect(url_for("planner"))
    return render_template("planner.html",items=db_select("content_items","scheduled_date"),generated=None,start_date=date.today().isoformat(),days=7,focus="")

@app.post("/planner/delete/<row_id>")
@login_required
def delete_content_item(row_id):
    db_delete("content_items",row_id); return redirect(url_for("planner"))

@app.post("/planner/generated/save")
@login_required
def save_generated_plan():
    import json
    from datetime import timedelta
    payload=json.loads(request.form.get("payload","{}")); start=date.fromisoformat(request.form.get("start_date") or date.today().isoformat())
    for item in payload.get("items",[]):
        db_insert("content_items",{"platform":item.get("platform","Facebook"),"scheduled_date":(start+timedelta(days=max(0,int(item.get("dayOffset",0))))).isoformat(),"theme":item.get("theme",""),"caption":item.get("caption",""),"hashtags":item.get("hashtags",""),"status":"idea"})
    flash("Generated content plan saved.","success"); return redirect(url_for("planner"))

@app.route("/strategy", methods=["GET","POST"])
@login_required
def strategy():
    if request.method=="POST":
        b=business_brief(); notes=request.form.get("notes","").strip(); plats=b["platforms"] or ["Facebook"]
        fallback={"title":"90-Day Digital Marketing Plan","summary":"Build consistency, learn from performance, then scale what works.","positioning":f"A practical, customer-focused {b['industry'] or 'small business'} brand that is easy to discover and trust.","pillars":[{"name":"Educate","description":"Share useful tips customers can act on."},{"name":"Connect","description":"Show the people and story behind the business."},{"name":"Convert","description":"Use clear offers, proof and calls to action."}],"channels":[{"channel":p,"plan":"Post consistently and review performance monthly."} for p in plats],"monthlyActions":["Refresh profiles","Publish consistently","Collect reviews","Review top posts","Test an offer","Adjust based on results"],"kpis":["Reach","Engagement rate","Followers","Leads","Profile actions"]}
        result=ai_json(f"""You are Hiraya, a practical digital marketing consultant for small businesses. Business: {b}. Extra context: {notes or 'none'}. Create a 90-day strategy. Return JSON keys title, summary, positioning, pillars, channels, monthlyActions, kpis. Keep it realistic and use only the business platforms.""",fallback)
        try:
            db_insert("strategies",{"title":result.get("title","90-Day Strategy"),"summary":result.get("summary",""),"details":result}); flash("Strategy saved.","success")
        except Exception as exc:
            log_exception("request", exc); flash(GENERIC_ERROR, "error")
        return redirect(url_for("strategy"))
    return render_template("strategy.html",strategies=db_select("strategies","created_at"),campaigns=db_select("ad_campaigns","created_at"),generated=None)

@app.post("/strategy/campaign")
@login_required
def save_campaign():
    try:
        db_insert("ad_campaigns",{"name":request.form.get("name","").strip(),"platform":request.form.get("platform","Facebook"),"objective":request.form.get("objective","").strip(),"budget":float(request.form.get("budget") or 0) or None,"targeting":request.form.get("targeting","").strip(),"ad_copy":request.form.get("ad_copy","").strip(),"notes":request.form.get("notes","").strip(),"status":request.form.get("status","idea")}); flash("Campaign idea saved.","success")
    except Exception as exc:
            log_exception("request", exc); flash(GENERIC_ERROR, "error")
    return redirect(url_for("strategy"))

@app.post("/strategy/campaign/<row_id>/delete")
@login_required
def delete_campaign(row_id):
    db_delete("ad_campaigns",row_id); return redirect(url_for("strategy"))

@app.post("/strategy/generate-ads")
@login_required
def generate_ads():
    b=business_brief(); budget=request.form.get("budget","").strip(); objective=request.form.get("objective","").strip(); plats=b["platforms"] or ["Facebook"]
    fallback={"summary":"Start small, test creative, and measure the response before scaling.","campaigns":[{"name":"Awareness test","platform":plats[0],"objective":objective or "Awareness","budgetShare":"50%","targeting":b["audience"] or "Relevant local customers","adCopy":"Discover what makes us worth trying. Message us to learn more.","expected":"Measure reach and engagement."},{"name":"Conversion test","platform":plats[0],"objective":"Leads or messages","budgetShare":"50%","targeting":b["audience"] or "Relevant local customers","adCopy":"Ready to try it? Send us a message for details.","expected":"Measure messages or leads; results are not guaranteed."}]}
    generated=ai_json(f"""You are Hiraya, a practical digital marketing consultant. Business: {b}. Budget: {budget or 'not given'}. Objective: {objective or 'not given'}. Return JSON with summary and 2-4 campaigns. Each needs name, platform, objective, budgetShare, targeting, adCopy <=200 chars, expected.""",fallback)
    return render_template("strategy.html",strategies=db_select("strategies","created_at"),campaigns=db_select("ad_campaigns","created_at"),generated=generated)

@app.route("/audit", methods=["GET","POST"])
@login_required
def audit():
    questions=[
    ("Profile completeness","How complete are your social media and business profiles?",[("Complete with photo, description, hours and contact",20),("Mostly filled in, a few gaps",13),("Just a name and a photo",6),("No proper profile yet",0)]),
    ("Posting consistency","How often do you post?",[("Several times a week, on a schedule",20),("About once a week",14),("A few times a month",7),("Rarely or only when I remember",0)]),
    ("Consistent branding","Do your posts look and sound like one brand?",[("Yes — same colours, logo and tone everywhere",20),("Mostly consistent",13),("It varies a lot",6),("I have no set look or tone",0)]),
    ("Customer reviews","How many customer reviews or testimonials do you have?",[("Many recent reviews and I reply to them",20),("Some reviews, mostly older",13),("One or two",6),("None yet",0)]),
    ("Discoverability","How easy is it for a new customer to find you online?",[("We show up on search and maps with correct details",20),("Findable if you know our name",12),("Only through social media",6),("Hard to find at all",0)])]
    audits=db_select("audits","created_at")
    if request.method=="POST":
        answers={}; total=0
        for key,_,opts in questions:
            val=request.form.get("q_"+key)
            if val is not None: answers[key]=val; total+=next((p for label,p in opts if label==val),0)
        if len(answers)!=len(questions): flash("Please answer every question.","error"); return render_template("audit.html",questions=questions,result=None,score=None,audits=audits)
        fallback={"summary":f"Your audit score is {total}/100. Prioritize the gaps that can improve visibility and consistency.","strengths":["You have started assessing your brand presence."],"gaps":["Some parts of your online presence can be made more consistent."],"recommendations":[{"title":"Complete profiles","action":"Add current photos, descriptions, hours and contact details.","effort":"Quick win"},{"title":"Set a posting rhythm","action":"Choose a sustainable weekly schedule and batch content.","effort":"Medium"},{"title":"Collect social proof","action":"Ask recent customers for reviews and reply to them.","effort":"Quick win"},{"title":"Improve discoverability","action":"Check search and map listings for accurate details.","effort":"Medium"}]}
        result=ai_json(f"""You are Hiraya, a practical digital marketing consultant for small businesses. Business: {business_brief()}. Audit score: {total}/100. Answers: {answers}. Return JSON with summary, strengths (2-4), gaps (2-4), recommendations (4-6 objects with title, action, effort).""",fallback)
        try:
            db_insert("audits",{"score":total,"summary":result.get("summary"),"strengths":result.get("strengths",[]),"gaps":result.get("gaps",[]),"recommendations":result.get("recommendations",[]),"answers":answers}); flash("Audit saved.","success")
        except Exception as exc:
            log_exception("request", exc); flash(GENERIC_ERROR, "error")
        return render_template("audit.html",questions=questions,result=result,score=total,audits=db_select("audits","created_at"))
    return render_template("audit.html",questions=questions,result=None,score=None,audits=audits)

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
                log_exception("assistant", exc)
                answer = "Sorry, I could not generate an answer right now. Please try again."
        return render_template("assistant.html", answer=answer, question=question)
    return render_template("assistant.html", answer=None, question="")

@app.errorhandler(404)
def not_found(_):
    return render_template("404.html"), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG") == "1")
