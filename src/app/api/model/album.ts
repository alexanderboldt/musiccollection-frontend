export class AlbumRequest {
  artistId: number = 0
  name: string = ''
  year: number = 0
  tracks: number = 0
}

export class AlbumResponse {
  id: number = 0
  artistId: number = 0
  name: string = ''
  filename?: string
  year: number = 0
  tracks: number = 0
}
