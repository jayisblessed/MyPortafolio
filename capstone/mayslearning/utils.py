from functools import wraps
from django.utils import timezone
from decimal import Decimal
import datetime
from django.urls import reverse
from django.contrib import messages
from django.shortcuts import redirect


# this is a generic function for calculating and setting the balance and renewal_date
def updateSubscription(userProfile):
    subscription_fee = Decimal('3.00')
    today = timezone.now()
    # if the user is subscribed and the renewal_date is less than 30 days from today
    if userProfile.subscribed and (userProfile.renewal_date - today) < datetime.timedelta(days=30):
        userProfile.balance -= subscription_fee
        userProfile.renewal_date += datetime.timedelta(days=30)
    return userProfile


# decorator for restricting access to views based on the user's subscription status
def subscriptionRequired(view_func):
    @wraps(view_func) # a decorator to wrap the function
    # arguments are request, *args, and **kwargs (allowing any additional positional and keyword arguments for the original view function)
    def _wrapped_view(request, *args, **kwargs):
        # check if the user: is authenticated, has a related userprofile object attached to it using hasattr(request.user, 'userprofile'), is the renewal_date attribute greater than the current time
        if request.user.is_authenticated and hasattr(request.user, 'userprofile') and (request.user.userprofile.renewal_date > timezone.now()):
            return view_func(request, *args, **kwargs) # call the original view function (view_func) with the request, *args, and **kwargs
        else:
            messages.warning(request, "This page is for users with valid subscriptions only. Please subscribe first.", extra_tags='danger')
            return redirect(reverse("profile"))
    return _wrapped_view # return the _wrapped_view function as the actual view function
