import { existsSync } from 'fs';
import { join } from 'path';

export const MONGODB_URI_PADRAO =
  'mongodb://localhost:27017/controle-financeiro';

/** De onde veio a URI do MongoDB usada na inicialização. */
export type OrigemUri =
  'variável de ambiente' | 'arquivo .env' | 'valor padrão';

/**
 * Resolve a MONGODB_URI na ordem: variável exportada no terminal, arquivo
 * .env na raiz do projeto e, por último, o MongoDB local na porta padrão.
 * O resultado fica em process.env.MONGODB_URI para o AppModule usar.
 */
export function carregarMongoUri(): { uri: string; origem: OrigemUri } {
  if (process.env.MONGODB_URI) {
    return { uri: process.env.MONGODB_URI, origem: 'variável de ambiente' };
  }

  const arquivoEnv = join(process.cwd(), '.env');
  if (existsSync(arquivoEnv)) {
    // Recurso nativo do Node (20.12+): não sobrescreve variáveis já definidas
    process.loadEnvFile(arquivoEnv);
    if (process.env.MONGODB_URI) {
      return { uri: process.env.MONGODB_URI, origem: 'arquivo .env' };
    }
  }

  process.env.MONGODB_URI = MONGODB_URI_PADRAO;
  return { uri: MONGODB_URI_PADRAO, origem: 'valor padrão' };
}

/** Esconde a senha da URI para poder exibi-la no log. */
export function mascararUri(uri: string): string {
  return uri.replace(/\/\/([^:@/]+):([^@]+)@/, '//$1:****@');
}
