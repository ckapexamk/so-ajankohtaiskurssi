from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request

from app.core.config import get_settings
from app.db.session import engine
from app.models.user import User
from app.models.activity_type import ActivityType
from app.models.unit_type import UnitType
from app.models.activity_type_unit_type import ActivityTypeUnitType
from app.models.workout_sessions import WorkoutSession
from app.models.workout_plan import WorkoutPlan

settings = get_settings()

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.email, User.display_name]
    column_details_exclude = [User.password_hash]

class ActivityTypeAdmin(ModelView, model=ActivityType):
    column_list = [ActivityType.id, ActivityType.name, ActivityType.slug]

class UnitTypeAdmin(ModelView, model=UnitType):
    column_list = [
        UnitType.id,
        UnitType.name,
        UnitType.slug,
        UnitType.unit_label,
        UnitType.is_system,
    ]

class ActivityTypeUnitTypeAdmin(ModelView, model=ActivityTypeUnitType):
    column_list = [
        ActivityTypeUnitType.activity_type_id,
        ActivityTypeUnitType.unit_type_id,
        ActivityTypeUnitType.sort_order,
        ActivityTypeUnitType.is_required,
        ActivityTypeUnitType.per_set,
    ]

class WorkoutSessionAdmin(ModelView, model=WorkoutSession):
    column_list = [
        WorkoutSession.user_id,
        WorkoutSession.name,
        WorkoutSession.session_at,
        WorkoutSession.status,
        WorkoutSession.intensity,
        WorkoutSession.plan_id,
        WorkoutSession.items,
    ]

class WorkoutPlanAdmin(ModelView, model=WorkoutPlan):
    column_list = [
        WorkoutPlan.user_id,
        WorkoutPlan.name,
        WorkoutPlan.notes,
        WorkoutPlan.start_date,
        WorkoutPlan.length_weeks,
        WorkoutPlan.created_at,
        WorkoutPlan.sessions,
]

class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()

        if (
            form.get("username") == settings.sqladmin_username
            and
            form.get("password") == settings.sqladmin_password
        ):
            request.session["authenticated"] = True
            return True

        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return request.session.get("authenticated", False)


def sqladmin(app) -> None:
    admin = Admin(app, engine,
        authentication_backend=AdminAuth(secret_key=settings.sqladmin_secret_key))
    admin.add_view(UserAdmin)
    admin.add_view(ActivityTypeAdmin)
    admin.add_view(UnitTypeAdmin)
    admin.add_view(ActivityTypeUnitTypeAdmin)
    admin.add_view(WorkoutSessionAdmin)
    admin.add_view(WorkoutPlanAdmin)