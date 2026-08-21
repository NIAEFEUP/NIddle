export interface Requestable<TPayload = any, TEntity = any> {
  createFromRequest(payload: TPayload, associationId: number): Promise<TEntity>;
  updateFromRequest(id: number, payload: TPayload): Promise<TEntity>;
  findOne(id: number): Promise<TEntity>;
}
