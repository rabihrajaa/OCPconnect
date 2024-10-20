import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import CommentItem from './CommentItem';

export default function CommentList({ comments, annonceId, currentUserName, onDelete, onReply, onDeleteReply }) {
  return (
    <ScrollView style={{ padding: 10 }}>
      {comments.length === 0 ? (
        <Text>No comments yet.</Text>
      ) : (
        comments.map((comment) => (
          <CommentItem
            annonceId={annonceId}
            currentUserName={currentUserName}
            key={comment.id}
            comment={comment}
            onDelete={onDelete}
            onReply={onReply} />
        ))
      )}
    </ScrollView>
  );
}
