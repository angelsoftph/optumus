export type BookFormDataType = {
  title: string;
  author: string;
  content: string;
  photo: File | null;
  category_id: number;
  status: string;
};

export type UserSignUpFormDataType = {
  fullname: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  photo: File | null;
};

export type UserType = {
  id: number;
  fullname: string;
  username: string;
  usertype: string;
  photo: string;
};

export type MessageType = {
  id: number;
  message: string;
  sender_id: number;
  recipient_id: number;
  is_read: number;
  is_deleted: number;
  created_at: string;
  user: UserType;
};

export type ThreadType = {
  user1: number;
  user2: UserType;
  last_message: string;
  created_at: string;
};

export type BookCategoryType = {
  id: number;
  name: string;
};

export type BookType = {
  id: number;
  title: string;
  author: string;
  content: string;
  photo: string;
  category_id: number;
  category_name: string;
  status: string;
};

export type LoanedBookType = {
  id: number;
  title: string;
  author: string;
  content: string;
  photo: string;
  category_id: number;
  category_name: string;
  status: string;
  loan_date: string;
  return_date: string;
};

export type HistoryType = {
  id: number;
  book_id: number;
  title: string;
  author: string;
  category_id: number;
  category_name: string;
  fullname: string;
  email: string;
  photo: string;
  status: string;
  created_at: string;
  updated_at: string;
};
