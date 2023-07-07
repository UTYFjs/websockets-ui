export interface WsResponse {
  type: string;
  data: string/*Record<string, number | boolean> | string*/;
  id: number
}