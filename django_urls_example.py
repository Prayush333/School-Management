# --- Django URL Configuration Example ---
# Add to your project's urls.py

from django.urls import path
from django.views.generic import TemplateView

urlpatterns = [
    path('', TemplateView.as_view(template_name='dashboard/dashboard.html'), name='dashboard'),
    path('students/', TemplateView.as_view(template_name='students/list.html'), name='students-list'),
    path('students/<int:pk>/', TemplateView.as_view(template_name='students/details.html'), name='students-detail'),
    path('students/<int:pk>/edit/', TemplateView.as_view(template_name='students/form.html'), name='students-form'),
    path('faculty/', TemplateView.as_view(template_name='faculty/list.html'), name='faculty-list'),
    path('faculty/add/', TemplateView.as_view(template_name='faculty/form.html'), name='faculty-form'),
    path('staff/', TemplateView.as_view(template_name='staff/list.html'), name='staff-list'),
    path('staff/add/', TemplateView.as_view(template_name='staff/form.html'), name='staff-form'),
    path('library/', TemplateView.as_view(template_name='library/books.html'), name='library-books'),
    path('library/issue/', TemplateView.as_view(template_name='library/issue.html'), name='library-issue'),
    path('library/return/', TemplateView.as_view(template_name='library/return.html'), name='library-return'),
    path('reports/', TemplateView.as_view(template_name='reports/reports.html'), name='reports'),
    path('settings/', TemplateView.as_view(template_name='settings/settings.html'), name='settings'),
]
