import { existsSync } from 'fs';
import { join } from 'path';

export const MONGODB_URI_PADRAO =
  'mongodb://localhost:27017/controle-financeiro';

/** De onde veio a URI do MongoDB usada na inicialização. */
export type OrigemUri =
  'variável de ambiente' | 'arquivo .env' | 'valor padrão';

/**
 * Nomes de variável aceitos para a URI do MongoDB. O app lê os dois porque
 * `MONGO_URI` é a convenção mais comum (Docker, Atlas, tutoriais), enquanto
 * `MONGODB_URI` é o nome usado na documentação deste projeto.
 */
const NOMES_DA_VARIAVEL = ['MONGODB_URI', 'MONGO_URI'] as const;

function uriDoAmbiente(): string | undefined {
  for (const nome of NOMES_DA_VARIAVEL) {
    const valor = process.env[nome];
    if (valor && valor.trim() !== '') {
      return valor.trim();
    }
  }
  return undefined;
}

/**
 * Resolve a URI na ordem: variável exportada no terminal (MONGODB_URI ou
 * MONGO_URI), arquivo .env na raiz do projeto e, por último, o MongoDB local
 * na porta padrão. O resultado fica em process.env.MONGODB_URI para o
 * AppModule usar.
 */
export function carregarMongoUri(): { uri: string; origem: OrigemUri } {
  const uriAmbiente = uriDoAmbiente();
  if (uriAmbiente) {
    process.env.MONGODB_URI = uriAmbiente;
    return { uri: uriAmbiente, origem: 'variável de ambiente' };
  }

  const arquivoEnv = join(process.cwd(), '.env');
  if (existsSync(arquivoEnv)) {
    // Recurso nativo do Node (20.12+): não sobrescreve variáveis já definidas
    process.loadEnvFile(arquivoEnv);
    const uriDoArquivo = uriDoAmbiente();
    if (uriDoArquivo) {
      process.env.MONGODB_URI = uriDoArquivo;
      return { uri: uriDoArquivo, origem: 'arquivo .env' };
    }
  }

  process.env.MONGODB_URI = MONGODB_URI_PADRAO;
  return { uri: MONGODB_URI_PADRAO, origem: 'valor padrão' };
}

/** Esconde a senha da URI para poder exibi-la no log. */
export function mascararUri(uri: string): string {
  return uri.replace(/\/\/([^:@/]+):([^@]+)@/, '//$1:****@');
}
