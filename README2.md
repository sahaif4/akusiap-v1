# SIAPI PEP I Audit App - Installation Guide

This guide provides step-by-step instructions for setting up the SIAPI PEP I Audit App backend locally and deploying it to a VPS.

## Prerequisites

- Python 3.8 or higher
- MySQL Server (for database)
- Git (for cloning the repository)

## Local Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Python and Create Virtual Environment

Ensure Python 3.8+ is installed. Create and activate a virtual environment:

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

If `requirements.txt` doesn't include all dependencies, install them manually:

```bash
pip install Django>=4.2 djangorestframework python-dotenv mysqlclient google-generativeai
```

### 4. Set Up Environment Variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
GEMINI_API_KEY=your-gemini-api-key-here
```

- `SECRET_KEY`: A random secret key for Django (generate one securely)
- `DEBUG`: Set to `True` for development
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `GEMINI_API_KEY`: Your Google Gemini API key for AI features

### 5. Set Up MySQL Database

1. Install MySQL Server if not already installed.
2. Create a database named `db_siapi_pepi`:

```sql
CREATE DATABASE db_siapi_pepi CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

3. Update `settings.py` to use MySQL (if not already configured):

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'db_siapi_pepi',
        'USER': 'your_mysql_username',
        'PASSWORD': 'your_mysql_password',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}
```

### 6. Run Migrations

Apply database migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Optional)

Create a Django admin superuser:

```bash
python manage.py createsuperuser
```

### 8. Seed Initial Data

Populate the database with initial data:

```bash
python manage.py seed_data
```

### 9. Run the Development Server

Start the Django development server:

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/`

## VPS Hosting Setup

### Prerequisites

- A VPS with Ubuntu/Debian (recommended)
- Domain name (optional but recommended for SSL)
- Root or sudo access

### 1. Update System and Install Dependencies

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv mysql-server nginx certbot python3-certbot-nginx -y
```

### 2. Set Up MySQL

Secure MySQL installation and create database:

```bash
sudo mysql_secure_installation
sudo mysql -u root -p
```

In MySQL shell:

```sql
CREATE DATABASE db_siapi_pepi CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'siapi_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON db_siapi_pepi.* TO 'siapi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clone Repository and Set Up Project

```bash
cd /var/www
sudo git clone <repository-url> siapi_app
cd siapi_app
sudo python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Or: pip install Django>=4.2 djangorestframework python-dotenv mysqlclient google-generativeai gunicorn
```

### 4. Configure Environment Variables

Create `.env` file:

```bash
sudo nano .env
```

Add:

```env
SECRET_KEY=your-very-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,your-server-ip
GEMINI_API_KEY=your-gemini-api-key-here
```

### 5. Update settings.py for Production

Ensure `settings.py` has production settings:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'db_siapi_pepi',
        'USER': 'siapi_user',
        'PASSWORD': 'strong_password_here',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
```

### 6. Run Migrations and Seed Data

```bash
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
python manage.py collectstatic --noinput
```

### 7. Set Up Gunicorn

Create a Gunicorn service file:

```bash
sudo nano /etc/systemd/system/gunicorn_siapi.service
```

Add:

```ini
[Unit]
Description=Gunicorn daemon for SIAPI App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/siapi_app
Environment="PATH=/var/www/siapi_app/venv/bin"
ExecStart=/var/www/siapi_app/venv/bin/gunicorn --workers 3 --bind unix:/var/www/siapi_app/siapi_app.sock siappepi_backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

Start and enable Gunicorn:

```bash
sudo systemctl start gunicorn_siapi
sudo systemctl enable gunicorn_siapi
```

### 8. Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/siapi_app
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com your-server-ip;

    location = /favicon.ico { access_log off; log_not_found off; }

    location /static/ {
        alias /var/www/siapi_app/static/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/siapi_app/siapi_app.sock;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/siapi_app /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Set Up SSL with Let's Encrypt (Optional but Recommended)

If you have a domain:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts to configure SSL.

### 10. Set Proper Permissions

```bash
sudo chown -R www-data:www-data /var/www/siapi_app
sudo chmod -R 755 /var/www/siapi_app
```

### 11. Firewall Configuration

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable
```

### 12. Test the Deployment

Visit your domain or server IP. The API should be accessible at `https://your-domain.com/api/`

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Ensure MySQL is running and credentials are correct in `settings.py`.

2. **Static Files Not Loading**: Run `python manage.py collectstatic` and ensure Nginx is configured correctly.

3. **Permission Denied**: Check file permissions and ownership, especially for the socket file.

4. **Gunicorn Not Starting**: Check the service status with `sudo systemctl status gunicorn_siapi` and logs with `sudo journalctl -u gunicorn_siapi`.

5. **Nginx 502 Bad Gateway**: Ensure Gunicorn is running and the socket path is correct.

### Logs

- Django logs: Check with `python manage.py runserver` output or configure logging in `settings.py`
- Gunicorn logs: `sudo journalctl -u gunicorn_siapi`
- Nginx logs: `/var/log/nginx/error.log` and `/var/log/nginx/access.log`

## API Endpoints

Once set up, the following endpoints are available:

- `GET/POST/PUT/DELETE /api/users/` - User management
- `GET/POST/PUT/DELETE /api/units/` - Unit management
- `GET/POST/PUT/DELETE /api/instruments/` - Instrument management
- `GET/POST/PUT/DELETE /api/findings/` - Findings management
- `POST /api/login/` - User login
- `POST /api/analyze-finding/` - AI analysis of findings

## Additional Notes

- For production, ensure `DEBUG=False` and use a strong `SECRET_KEY`.
- Regularly backup your MySQL database.
- Monitor server resources and scale as needed.
- Consider using a process manager like Supervisor for more advanced deployment scenarios.
