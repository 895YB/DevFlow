export interface Document {
  _id: string;
  workspace: string;
  title: string;
  content: string;
  icon: string;
  coverImage: string;
  parent: string | null;
  order: number;
  createdBy: string | { _id: string; displayName: string; avatar: string };
  lastEditedBy: string | { _id: string; displayName: string; avatar: string };
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  _id: string;
  document: string;
  title: string;
  content: string;
  editedBy: string | { _id: string; displayName: string; avatar: string };
  createdAt: Date;
}

export interface DocumentTreeNode {
  _id: string;
  title: string;
  icon: string;
  parent: string | null;
  order: number;
  children: DocumentTreeNode[];
}
