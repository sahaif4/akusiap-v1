from rest_framework import serializers
from .models import UserProfile, Unit, Instrument, Finding, QuestionBank, AuditCycle, AuditAssignment, DeskEvaluation, ActivityLog, StandardDocument, UPMAgenda, UPMProfile, UPMMember, UPMProgram

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'

class InstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instrument
        fields = '__all__'

class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finding
        fields = '__all__'

class QuestionBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBank
        fields = '__all__'

class AuditCycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditCycle
        fields = '__all__'

class AuditAssignmentSerializer(serializers.ModelSerializer):
    audit_cycle_name = serializers.CharField(source='audit_cycle.name', read_only=True)
    unit_name = serializers.CharField(source='unit.nama_unit', read_only=True)
    auditor1_name = serializers.CharField(source='auditor1.nama', read_only=True)
    auditor2_name = serializers.CharField(source='auditor2.nama', read_only=True)

    class Meta:
        model = AuditAssignment
        fields = '__all__'

class DeskEvaluationSerializer(serializers.ModelSerializer):
    instrument_question = serializers.CharField(source='instrument.pertanyaan', read_only=True)
    auditor_name = serializers.CharField(source='auditor.nama', read_only=True)

    class Meta:
        model = DeskEvaluation
        fields = '__all__'

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.nama', read_only=True)
    user_avatar = serializers.CharField(source='user.foto', read_only=True)

    class Meta:
        model = ActivityLog
        fields = '__all__'

class StandardDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.nama', read_only=True)

    class Meta:
        model = StandardDocument
        fields = '__all__'


class UPMAgendaSerializer(serializers.ModelSerializer):
    unit_ids = serializers.PrimaryKeyRelatedField(source='units', many=True, queryset=Unit.objects.all(), required=False)
    unit_codes = serializers.SerializerMethodField()
    unit_names = serializers.SerializerMethodField()

    class Meta:
        model = UPMAgenda
        fields = [
            'id',
            'title',
            'description',
            'start_date',
            'target_date',
            'status',
            'agenda_type',
            'responsible_unit',
            'reminder_days_before',
            'is_active',
            'progress',
            'created_at',
            'unit_ids',
            'unit_codes',
            'unit_names',
        ]

    def get_unit_codes(self, obj):
        return list(obj.units.values_list('kode_unit', flat=True))

    def get_unit_names(self, obj):
        return list(obj.units.values_list('nama_unit', flat=True))

class UPMProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UPMProfile
        fields = '__all__'

class UPMMemberSerializer(serializers.ModelSerializer):
    division_display = serializers.CharField(source='get_division_display', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = UPMMember
        fields = '__all__'

class UPMProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = UPMProgram
        fields = '__all__'
