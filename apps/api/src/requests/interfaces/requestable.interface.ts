export interface Requestable<
  TPayload = any,
  TEntity = any,
  TUpdatePayload = Partial<TPayload>,
> {
  createFromRequest(payload: TPayload, associationId: number): Promise<TEntity>;
  updateFromRequest(id: number, payload: TUpdatePayload): Promise<TEntity>;
  remove(id: number): Promise<TEntity>;
  findOne(id: number): Promise<TEntity>;
  createPayloadType: new () => TPayload;
  updatePayloadType: new () => TUpdatePayload;
}
