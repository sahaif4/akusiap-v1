from django.contrib import admin
from .models import Unit, Instrument, Finding, UserProfile, QuestionBank, AuditCycle, AuditAssignment, DeskEvaluation, ActivityLog, StandardDocument

admin.site.register(Unit)
admin.site.register(Instrument)
admin.site.register(Finding)
admin.site.register(UserProfile)
admin.site.register(QuestionBank)
admin.site.register(AuditCycle)
admin.site.register(AuditAssignment)
admin.site.register(DeskEvaluation)
admin.site.register(ActivityLog)
admin.site.register(StandardDocument)
