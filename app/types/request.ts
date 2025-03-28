export interface IRequest {
  operationName: string;
  variables: IRequestVariables | IFileRequestVariables;
}

export interface IFileRequestVariables {
  first?: number | null;
  last?: number | null;
  after?: string | null;
  before?: string | null;
  sortKey?: string | null;
  reverse?: boolean;
  query?: string | null;
}

export interface IRequestVariables {
  first?: number | null;
  last?: number | null;
  after?: string | null;
  before?: string | null;
  sortKey?: string | null;
  reverse?: Boolean;
  query?: string | null;
  savedSearchesLimit?: number | null;
  connectedResourcesFirst?: number | null;
}
