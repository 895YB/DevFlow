export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type BodyType = 'none' | 'json' | 'form' | 'raw';

export type AuthType = 'none' | 'bearer' | 'basic' | 'apikey';

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestBody {
  type: BodyType;
  content: string;
}

export interface RequestAuth {
  type: AuthType;
  bearer?: string;
  username?: string;
  password?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyIn?: 'header' | 'query';
}

export interface ApiRequest {
  _id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  auth: RequestAuth;
  order: number;
}

export interface ApiCollection {
  _id: string;
  userId: string;
  name: string;
  description: string;
  requests: ApiRequest[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiEnvironment {
  _id: string;
  userId: string;
  name: string;
  variables: KeyValuePair[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  duration: number;
  size: number;
}

export interface ApiHistoryEntry {
  _id: string;
  userId: string;
  method: HttpMethod;
  url: string;
  request: {
    params: KeyValuePair[];
    headers: KeyValuePair[];
    body: RequestBody;
    auth: RequestAuth;
  };
  response: ApiResponseData | null;
  executedAt: Date;
}
