from rest_framework import viewsets, serializers
from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import models
from .models import UserProfile, Unit, Instrument, Finding, QuestionBank, AuditCycle, AuditAssignment, DeskEvaluation, ActivityLog, StandardDocument, UPMAgenda, UPMProfile, UPMMember, UPMProgram
from .serializers import UserProfileSerializer, UnitSerializer, InstrumentSerializer, FindingSerializer, QuestionBankSerializer, AuditCycleSerializer, AuditAssignmentSerializer, DeskEvaluationSerializer, ActivityLogSerializer, StandardDocumentSerializer, UPMAgendaSerializer, UPMProfileSerializer, UPMMemberSerializer, UPMProgramSerializer


def _get_user_profile_from_request(request):
    username = getattr(request.user, 'username', None)
    if not username:
        return None
    try:
        return UserProfile.objects.get(nip=username)
    except UserProfile.DoesNotExist:
        return None


class IsUPMAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user_profile = _get_user_profile_from_request(request)
        if not user_profile:
            return False
        return user_profile.role in ['Super Admin', 'Admin UPM']

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer

class InstrumentViewSet(viewsets.ModelViewSet):
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer

class FindingViewSet(viewsets.ModelViewSet):
    queryset = Finding.objects.all()
    serializer_class = FindingSerializer

class QuestionBankViewSet(viewsets.ModelViewSet):
    queryset = QuestionBank.objects.all()
    serializer_class = QuestionBankSerializer

class AuditCycleViewSet(viewsets.ModelViewSet):
    queryset = AuditCycle.objects.all()
    serializer_class = AuditCycleSerializer

class AuditAssignmentViewSet(viewsets.ModelViewSet):
    queryset = AuditAssignment.objects.all()
    serializer_class = AuditAssignmentSerializer

class DeskEvaluationViewSet(viewsets.ModelViewSet):
    queryset = DeskEvaluation.objects.all()
    serializer_class = DeskEvaluationSerializer

class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer

class StandardDocumentViewSet(viewsets.ModelViewSet):
    queryset = StandardDocument.objects.all()
    serializer_class = StandardDocumentSerializer

class UPMAgendaViewSet(viewsets.ModelViewSet):
    queryset = UPMAgenda.objects.all()
    serializer_class = UPMAgendaSerializer

class UPMProfileViewSet(viewsets.ModelViewSet):
    queryset = UPMProfile.objects.all()
    serializer_class = UPMProfileSerializer
    permission_classes = [IsAuthenticated]

class UPMMemberViewSet(viewsets.ModelViewSet):
    queryset = UPMMember.objects.all()
    serializer_class = UPMMemberSerializer
    permission_classes = [IsAuthenticated]

class UPMProgramViewSet(viewsets.ModelViewSet):
    queryset = UPMProgram.objects.all()
    serializer_class = UPMProgramSerializer
    permission_classes = [IsAuthenticated]

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        import json
        from django.contrib.auth.models import User
        from rest_framework_simplejwt.tokens import RefreshToken
        
        try:
            data = json.loads(request.body)
            nip = data.get('username')
            password = data.get('password')
        except:
            nip = request.POST.get('username')
            password = request.POST.get('password')
        
        try:
            user_profile = UserProfile.objects.get(nip=nip, password=password)
            
            user, created = User.objects.get_or_create(username=nip)
            if created:
                user.set_password(password)
                user.save()
            
            refresh = RefreshToken.for_user(user)
            
            unit = None
            if user_profile.unit_id:
                try:
                    unit = Unit.objects.get(id=user_profile.unit_id)
                    unit_data = {
                        'id': unit.id,
                        'kode_unit': unit.kode_unit,
                        'nama_unit': unit.nama_unit,
                        'jenis_unit': unit.jenis_unit
                    }
                except Unit.DoesNotExist:
                    unit_data = None
            else:
                unit_data = None
                
            return JsonResponse({
                'message': 'Login successful',
                'user': {
                    'id': user_profile.id,
                    'nama': user_profile.nama,
                    'role': user_profile.role,
                    'unit_id': unit_data['id'] if unit_data else None,
                    'assignedUnits': user_profile.assignedUnits
                },
                'unit': unit_data,
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })
        except UserProfile.DoesNotExist:
            return JsonResponse({'message': 'Invalid credentials'}, status=401)
    return JsonResponse({'message': 'Method not allowed'}, status=405)

@csrf_exempt
def ai_analyze_finding(request):
    return JsonResponse({'analysis': 'AI analysis result placeholder'})

@csrf_exempt
def get_desk_evaluation_instruments(request):
    unit_name = request.GET.get('unit_name')
    if not unit_name:
        return JsonResponse([], safe=False)
    
    # Filter instruments by unit_target (Unit Name) and is_published=True
    instruments = Instrument.objects.filter(unit_target=unit_name, is_published=True)
    serializer = InstrumentSerializer(instruments, many=True)
    
    # Return list directly to match frontend expectation
    return JsonResponse(serializer.data, safe=False)

@csrf_exempt
def submit_desk_evaluation_response(request):
    if request.method == 'POST':
        import json
        try:
            data = json.loads(request.body)
            # Support both endpoint formats (response/ and submit-response/)
            instrument_id = data.get('instrument_id') or data.get('instrument')
            
            if not instrument_id:
                return JsonResponse({'status': 'error', 'message': 'Instrument ID required'}, status=400)

            inst = Instrument.objects.get(id=instrument_id)
            
            if 'answer_text' in data:
                inst.jawaban_auditee = data['answer_text']
            
            if 'uploaded_file' in data:
                inst.doc_file = data['uploaded_file']
                inst.doc_status = 'Diunggah'
                inst.doc_note = '' # Clear rejection note
            
            inst.save()
            return JsonResponse({'status': 'ok'})
        except Instrument.DoesNotExist:
             return JsonResponse({'status': 'error', 'message': 'Instrument not found'}, status=404)
        except Exception as e:
             return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def get_submission_status(request):
    unit_name = request.GET.get('unit_name')
    # For now, return DRAFT or SUBMITTED based on instruments
    # Ideally this should be stored in AuditAssignment or similar
    try:
        # Check if any instrument has file uploaded
        has_uploads = Instrument.objects.filter(unit_target=unit_name).exclude(doc_file__exact='').exclude(doc_file__isnull=True).exists()
        
        # Check if AuditAssignment exists and has specific status
        assignment = AuditAssignment.objects.filter(unit__nama_unit=unit_name).last()
        
        status = 'DRAFT'
        if assignment:
             if assignment.status == 'FIELD_AUDIT' or assignment.status == 'FINISHED':
                 status = 'SUBMITTED'
             elif has_uploads:
                 # If user has uploaded but assignment is still DESK_EVALUATION, 
                 # we can consider it SUBMITTED if they explicitly set it (which we can't track without a field).
                 # For now, let's rely on frontend 'ready' state, or maybe use a special flag on Unit?
                 # Or just return DRAFT and let frontend handle it.
                 # But frontend calls this to set initial state.
                 pass
        
        return JsonResponse({'status': status})
    except:
        return JsonResponse({'status': 'DRAFT'})

@csrf_exempt
def set_submission_status(request):
    if request.method == 'POST':
        import json
        try:
            data = json.loads(request.body)
            unit_name = data.get('unit_name')
            status = data.get('status')
            
            # Here we would update the status. 
            # Since we don't have a dedicated submission_status field on a model yet,
            # We can update AuditAssignment status if it's 'SUBMITTED' -> 'DESK_EVALUATION' (Ready for auditor)
            # But 'DESK_EVALUATION' is the default.
            
            # For now, just return OK to satisfy the frontend call.
            # Real implementation would require a 'submission_status' field on AuditAssignment.
            return JsonResponse({'status': 'ok'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error'}, status=405)

@csrf_exempt
def submit_desk_evaluation_score(request):
    return JsonResponse({'status': 'ok'})

@csrf_exempt
def get_dashboard_data(request):
    unit_name = request.GET.get('unit')
    
    # Basic aggregation logic (placeholder implementation)
    # In a real scenario, this would query Finding, Instrument, etc. models
    
    total_findings = Finding.objects.filter(unit=unit_name).count() if unit_name else Finding.objects.count()
    major_findings = Finding.objects.filter(unit=unit_name, tipe='mayor').count() if unit_name else Finding.objects.filter(tipe='mayor').count()
    minor_findings = Finding.objects.filter(unit=unit_name, tipe='minor').count() if unit_name else Finding.objects.filter(tipe='minor').count()
    
    # Calculate average score from DeskEvaluation or Instruments
    # For now, return mock/calculated data to prevent frontend crash
    
    data = {
        "stats": {
            "average_score": 3.2, # Placeholder or calc
            "total_findings": total_findings,
            "major_findings": major_findings,
            "minor_findings": minor_findings
        },
        "radar": [
            {"criteria": "K1", "score": 3.5},
            {"criteria": "K2", "score": 3.0},
            {"criteria": "K3", "score": 3.2},
            {"criteria": "K4", "score": 2.8},
            {"criteria": "K5", "score": 3.4},
            {"criteria": "K6", "score": 3.6},
            {"criteria": "K7", "score": 3.1},
            {"criteria": "K8", "score": 3.3},
            {"criteria": "K9", "score": 3.0}
        ],
        "trends": [
            {"period": "2021", "findings": 12},
            {"period": "2022", "findings": 8},
            {"period": "2023", "findings": 5},
            {"period": "2024", "findings": total_findings}
        ],
        "composition": [
            {"name": "Patuh", "value": 60, "color": "#10b981"},
            {"name": "Patuh Bersyarat", "value": 25, "color": "#3b82f6"},
            {"name": "Tidak Patuh", "value": 15, "color": "#ef4444"}
        ]
    }
    
    return JsonResponse({'data': data})

@csrf_exempt
def update_user_profile(request):
    return JsonResponse({'status': 'ok'})

@csrf_exempt
def finalize_desk_evaluation(request):
    return JsonResponse({'status': 'ok'})

@csrf_exempt
def get_audit_status(request):
    return JsonResponse({'status': 'ok'})

@csrf_exempt
def activate_audit_planning(request):
    if request.method == 'POST':
        import json
        try:
            data = json.loads(request.body)
            unit_name = data.get('unit_name')
            if not unit_name:
                return JsonResponse({'status': 'error', 'message': 'Unit name required'}, status=400)

            # Publish all instruments for this unit
            Instrument.objects.filter(unit_target=unit_name).update(is_published=True)
            
            return JsonResponse({'status': 'ok'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error'}, status=405)
