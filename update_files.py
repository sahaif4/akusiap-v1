import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from audit_app.models import StandardDocument

docs = StandardDocument.objects.all()
for doc in docs:
    if 'standard_documents' in str(doc.file):
        doc.file = f'standard_documents/{os.path.basename(str(doc.file))}'
        doc.save()
        print(f'Updated {doc.nama_dokumen}')
1