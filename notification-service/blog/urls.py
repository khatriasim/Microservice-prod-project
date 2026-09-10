from django.urls import path
from .views import CreatePostView, ListPostsView, MyPostView, DeletePostView, EditPostVIew, AuthorPostsView, AddCommentView, DeleteCommentView, ListCommentView, MarkAsReadView, ToggleCommentLikeView
from .views import TogglePostLikeView, CreateCategoryView, ListCategoryView, PostByCategoryView, FollowView, FollowingListView, FollowersListView, FeedView, ListNotification, MarkAllReadView, PostDetailView
urlpatterns = [
    path('create/', CreatePostView.as_view(), name='create-post'),
    path('posts/', ListPostsView.as_view(), name='list-posts'),
    path('myposts/', MyPostView.as_view(), name='my-posts'),
    path('delete/<int:pk>/', DeletePostView.as_view(), name='delete-post'),
    path('edit/<int:pk>/', EditPostVIew.as_view(), name='edit-post'),
    path('author/<str:username>/', AuthorPostsView.as_view(), name='author'),
    path('add-comment/<int:pk>/', AddCommentView.as_view(), name='add-comment'),
    path('list-comment/<int:pk>/', ListCommentView.as_view(), name='list-comment'),
    path('delete-comment/<int:pk>/', DeleteCommentView.as_view(), name='delete-comment'),
    path('like-post/<int:pk>/', TogglePostLikeView.as_view(), name='like-post'),
    path('like-comment/<int:pk>/', ToggleCommentLikeView.as_view(), name='like-comment'),
    path('add-category/', CreateCategoryView.as_view(), name='create-category'),
    path('list-category/', ListCategoryView.as_view(), name='list-category'),
    path('post-category/<int:pk>/', PostByCategoryView.as_view(), name='list-category'),
    path('follow/<str:username>/', FollowView.as_view(), name='follow'),
    path('followers/<str:username>/', FollowersListView.as_view()),
    path('following/<str:username>/', FollowingListView.as_view()),
    path('feed/', FeedView.as_view()),
    path('list-notification/', ListNotification.as_view()),
    path('notification/<int:pk>/read/', MarkAsReadView.as_view()),
    path('mark-all/', MarkAllReadView.as_view()),
    path('post/<int:pk>/', PostDetailView.as_view()),

]