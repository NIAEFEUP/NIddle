export interface Requestable<
  TPayload = any,
  TEntity = any,
  TUpdatePayload = Partial<TPayload>,
> {
  createFromRequest(payload: TPayload, associationId: string): Promise<TEntity>;
  updateFromRequest(id: string, payload: TUpdatePayload): Promise<TEntity>;
  removeFromRequest(id: string): Promise<TEntity>;
}
