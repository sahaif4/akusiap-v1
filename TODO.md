# TODO: Fix Standard Documents Upload Connection

## Completed Tasks
- [x] Update StandardDocument interface in types.ts to match Django model
- [x] Implement getStandardDocuments in apiService.ts to fetch from API
- [x] Implement saveStandardDocument in apiService.ts for uploading
- [x] Update UPMAdminView.tsx to fetch and display real standard documents
- [x] Update AddStandardDocModal to include file upload and kategori selection
- [x] Update table to show nama_dokumen, kategori, tanggal_upload, and download link
- [x] Fix TypeScript errors for file type and API_BASE_URL import

## Followup Steps
- [ ] Test the upload functionality by running the app and uploading a document
- [ ] Verify that files are stored correctly in Django media/standard_documents/
- [ ] Ensure download links work properly
- [ ] Check for any CORS or authentication issues if present
