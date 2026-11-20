export type Papel = 'ADMIN' | 'ESPECTADOR'

export interface Usuario {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  papel: Papel
  is_active?: boolean
}

export interface Filme {
  id: string
  nome: string
  genero: string
  sinopse: string
  imagem: string | null
  nota: string
  duracao: number
  ano_lancamento: number
  is_favorite: boolean
  criado_por: string | null
}

export interface FiltrosFilme {
  search?: string
  genero?: string
  ordering?: string
  favoritos?: boolean
}

export interface CadastroUsuario {
  username: string
  first_name: string
  last_name: string
  email: string
  password: string
}
