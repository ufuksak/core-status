export interface Paging {
  page: number
  per_page: number
  total: number
}

export interface PagingResponse {
  meta: Paging
}
