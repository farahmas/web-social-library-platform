from django.db.models.signals import post_save
from django.dispatch import receiver

from ratings.models import BookRating, FilmRating
from reviews.models import BookReview, FilmReview
from library.models import BookLibraryStatus, FilmLibraryStatus
from custom_lists.models import CustomListItem
from .models import Activity


@receiver(post_save, sender=BookRating)
def activity_book_rating(sender, instance, created, **kwargs):
    Activity.objects.create(
        user=instance.user,
        activity_type='rate_book',
        book=instance.book,
        rating_book=instance
    )


@receiver(post_save, sender=FilmRating)
def activity_film_rating(sender, instance, created, **kwargs):
    Activity.objects.create(
        user=instance.user,
        activity_type='rate_film',
        film=instance.film,
        rating_film=instance
    )


@receiver(post_save, sender=BookReview)
def activity_book_review(sender, instance, created, **kwargs):
    Activity.objects.create(
        user=instance.user,
        activity_type='review_book',
        book=instance.book,
        review_book=instance
    )


@receiver(post_save, sender=FilmReview)
def activity_film_review(sender, instance, created, **kwargs):
    Activity.objects.create(
        user=instance.user,
        activity_type='review_film',
        film=instance.film,
        review_film=instance
    )


@receiver(post_save, sender=BookLibraryStatus)
def activity_book_library(sender, instance, created, **kwargs):
    Activity.objects.create(
        user=instance.user,
        activity_type='library_update',
        book=instance.book,
        description=f"Set book status to {instance.status}"
    )


@receiver(post_save, sender=FilmLibraryStatus)
def activity_film_library(sender, instance, created, **kwargs):
    Activity.objects.create(
        user=instance.user,
        activity_type='library_update',
        film=instance.film,
        description=f"Set film status to {instance.status}"
    )


@receiver(post_save, sender=CustomListItem)
def activity_custom_list_item(sender, instance, created, **kwargs):
    Activity.objects.create(
        user=instance.custom_list.user,
        activity_type='custom_list_add',
        book=instance.book,
        film=instance.film,
        description=f"Added to {instance.custom_list.name}"
    )
