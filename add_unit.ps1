$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY3MzYzMzI2LCJpYXQiOjE3NjczNTk3MjYsImp0aSI6IjIyNGVjMDJiMjc5ZDQ3ZjNhMmViYWJmNGI3ZmE3Mjk3IiwidXNlcl9pZCI6IjIifQ.PHSTNjwJn-8gjs-TRB2zF0vkU7gdacKruJbo6gxFhl0"
$body = @{
    code = "THP"
    name = "Teknologi Hasil Pertanian"
    type = "prodi"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/units/" -Method POST -Headers @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
} -Body $body
