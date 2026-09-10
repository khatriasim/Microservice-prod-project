from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from  rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.conf import settings
import logging

from .models import Conversation, Message
from .serializers import ConversationListSerializer, MessageSerializer, ConversationSerializer
from .services import get_ai_response

logger = logging.getLogger(__name__)

class  ConversationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConversationSerializer
        return ConversationListSerializer
    
    def get_queryset(self):
        return  Conversation.objects.filter(user= self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ConversationDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        conversation = get_object_or_404(
            Conversation, id=conversation_id, user=request.user
        )
        user_content = request.data.get('message', "").strip()
        if not user_content:
            return Response(
                {'error':"message cant be empty"}, status=status.HTTP_400_BAD_REQUEST
            )
        Message.objects.create(conversation=conversation, role= 'user', content = user_content)

        if conversation.title == 'New Chat':
            conversation.title = user_content[:60]
            conversation.save()
        
        try:
            ai_text = get_ai_response(conversation)
        except Exception as exc:
            logger.exception("AI response failed for conversation %s", conversation.id)
            error = 'AI response failed. Check your Gemini API key, model, quota, or server logs.'
            if settings.DEBUG:
                error = f'{error} Detail: {exc}'
            return Response({'error': error}, status=status.HTTP_502_BAD_GATEWAY)

        assistant_message = Message.objects.create(conversation=conversation, role = 'assistant', content =ai_text)
        return Response(MessageSerializer(assistant_message).data, status=status.HTTP_201_CREATED)
