from django.db import models

class Book(models.Model):
    external_id = models.CharField(max_length=200)  
    title = models.CharField(max_length=500)
    authors = models.TextField(blank=True, null=True) 
    description = models.TextField(blank=True, null=True)
    page_count = models.IntegerField(blank=True, null=True)
    publish_year = models.IntegerField(blank=True, null=True)
    cover_url = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
