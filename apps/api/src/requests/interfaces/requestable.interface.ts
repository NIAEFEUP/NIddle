export interface Requestable<
  TPayload = any,
  TEntity = any,
  TUpdatePayload = Partial<TPayload>,
> {
  createFromRequest(payload: TPayload, associationId: number): Promise<TEntity>;
  updateFromRequest(id: number, payload: TUpdatePayload): Promise<TEntity>;
  removeFromRequest(id: number): Promise<TEntity>;
}
