import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import CommentItem from './CommentItem';

export default function CommentList({ comments, onDelete, onReply }) {
  return (
    <ScrollView style={{ padding: 10 }}>
      {comments.length === 0 ? (
        <Text>No comments yet.</Text>
      ) : (
        comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} onDelete={onDelete} onReply={onReply} />
        ))
      )}
    </ScrollView>
  );
}
