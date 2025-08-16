import { gql } from '@apollo/client';

// Chats (owned by the current user) — note user_id is uuid!
export const GET_CHATS = gql`
  query getChats($user_id: uuid!) {
    chats(where: { user_id: { _eq: $user_id } }, order_by: { created_at: desc }) {
      id
      title
      created_at
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation createChat($user_id: uuid!, $title: String!) {
    insert_chats_one(object: { user_id: $user_id, title: $title }) {
      id
      title
      created_at
    }
  }
`;

// Real-time messages for a chat
export const GET_MESSAGES_SUB = gql`
  subscription messagesByChat($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }, order_by: { created_at: asc }) {
      id
      chat_id
      message
      is_bot
      created_at
    }
  }
`;

// Insert a user message (if your messages.user_id column is uuid, change variable types accordingly)
export const INSERT_MESSAGE = gql`
  mutation insertMessage($chat_id: uuid!, $message: String!, $is_bot: Boolean!) {
    insert_messages_one(object: { chat_id: $chat_id, message: $message, is_bot: $is_bot }) {
      id
      message
      is_bot
      created_at
    }
  }
`;

// Hasura Action 'sendMessage' which must be created in Hasura and point to n8n webhook
export const SEND_MESSAGE_ACTION = gql`
  mutation sendMessageAction($chat_id: uuid!, $message: String!) {
    sendMessage(chat_id: $chat_id, message: $message) {
      
      success
    }
  }
`;
