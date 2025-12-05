from django.db import models

class Film(models.Model):
    external_id = models.CharField(max_length=100) 
    title = models.CharField(max_length=255)
    overview = models.TextField(blank=True, null=True)
    release_year = models.IntegerField(blank=True, null=True)
    runtime = models.IntegerField(blank=True, null=True)
    director = models.CharField(max_length=255, blank=True, null=True)
    genres = models.TextField(blank=True, null=True) 
    poster_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    actors = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.title
