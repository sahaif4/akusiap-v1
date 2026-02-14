from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FindingViewSet, UnitViewSet, InstrumentViewSet, UserProfileViewSet, QuestionBankViewSet,
    AuditCycleViewSet, AuditAssignmentViewSet, DeskEvaluationViewSet, ActivityLogViewSet, StandardDocumentViewSet,
    UPMAgendaViewSet, UPMProfileViewSet, UPMMemberViewSet, UPMProgramViewSet,
    ai_analyze_finding, login_user, get_desk_evaluation_instruments, submit_desk_evaluation_response,
    submit_desk_evaluation_score, get_dashboard_data, update_user_profile, activate_audit_planning,
    finalize_desk_evaluation, get_audit_status, get_submission_status, set_submission_status
)

# Router ini otomatis membuat URL untuk CRUD (Create, Read, Update, Delete)
router = DefaultRouter()
router.register(r'findings', FindingViewSet, basename='finding')
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'instruments', InstrumentViewSet, basename='instrument')
router.register(r'users', UserProfileViewSet, basename='userprofile')
router.register(r'question-bank', QuestionBankViewSet, basename='questionbank')
router.register(r'audit-cycles', AuditCycleViewSet, basename='auditcycle')
router.register(r'audit-assignments', AuditAssignmentViewSet, basename='auditassignment')
router.register(r'desk-evaluations', DeskEvaluationViewSet, basename='deskevaluation')
router.register(r'activity-logs', ActivityLogViewSet, basename='activitylog')
router.register(r'standard-documents', StandardDocumentViewSet, basename='standarddocument')
router.register(r'upm-agendas', UPMAgendaViewSet, basename='upmagenda')
router.register(r'upm-profiles', UPMProfileViewSet, basename='upmprofile')
router.register(r'upm-members', UPMMemberViewSet, basename='upmmember')
router.register(r'upm-programs', UPMProgramViewSet, basename='upmprogram')

# Daftar URL untuk aplikasi audit
urlpatterns = [
    # URL untuk CRUD (misal: /api/findings/, /api/units/, /api/users/)
    path('', include(router.urls)),

    # URL spesifik
    path('login/', login_user),
    path('analyze-finding/', ai_analyze_finding),
    path('desk-evaluation/instruments/', get_desk_evaluation_instruments),
    path('desk-evaluation/response/', submit_desk_evaluation_response),
    path('desk-evaluation/submit-response/', submit_desk_evaluation_response),
    path('desk-evaluation/status/', get_submission_status),
    path('desk-evaluation/set-status/', set_submission_status),
    path('desk-evaluation/score/', submit_desk_evaluation_score),
    path('dashboard/', get_dashboard_data),
    path('update-profile/', update_user_profile),
    path('activate-planning/', activate_audit_planning),
    path('desk-evaluation/finalize/', finalize_desk_evaluation),
    path('audit-status/', get_audit_status),
]
