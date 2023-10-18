export interface RootList<TEntity> {
  data: Data<TEntity>;
}

export interface Data<TEntity> {
  result: Result<TEntity>;
}

export interface Result<TEntity> {
  nodes: TEntity[];
}
