# TODO: Fix ImportError in audit_app

## Completed Steps
- [x] Update models.py: remove Instrument and Finding, add Criteria, DeskEvaluationQuestion, DeskEvaluationAnswer
- [x] Update views.py: change imports to minimal, remove UserViewSet, FindingViewSet, InstrumentViewSet, add get_user_model for UserSerializer
- [x] Update serializers.py: change imports, remove FindingSerializer, InstrumentSerializer, use get_user_model for User
- [x] Update urls.py: comment out users, findings, instruments registrations

## Next Steps
- [ ] Run Django migrations to apply model changes
- [ ] Restart Django server with --noreload
- [ ] Test import in shell: from audit_app.models import DeskEvaluationQuestion
- [ ] Verify server starts without ImportError
