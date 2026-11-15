import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { carregarMongoUri, mascararUri } from './config/mongo.config';

const logger = new Logger('Inicializacao');

async function bootstrap() {
  const { uri, origem } = carregarMongoUri();
  logger.log(`MongoDB: ${mascararUri(uri)} (origem: ${origem})`);

  let app: NestExpressApplication;
  try {
    // abortOnError: false faz o erro de inicialização chegar até este catch,
    // em vez de o Nest encerrar o processo sozinho.
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      abortOnError: false,
    });
  } catch (erro) {
    mostrarErroDeConexao(uri, origem, erro);
    process.exit(1);
  }

  // Front-end (HTML, CSS e JS) servido como arquivos estáticos de src/public
  app.useStaticAssets(join(process.cwd(), 'src', 'public'));

  const porta = Number(process.env.PORT ?? 3000);
  try {
    await app.listen(porta);
  } catch (erro) {
    if ((erro as NodeJS.ErrnoException).code === 'EADDRINUSE') {
      logger.error(
        `A porta ${porta} já está em uso por outro programa. ` +
          `Encerre esse programa ou rode com outra porta: PORT=3001 npm run start:dev`,
      );
      process.exit(1);
    }
    throw erro;
  }

  logger.log(`Aplicação no ar: http://localhost:${porta}`);
  logger.log(`API de transações: http://localhost:${porta}/transacoes`);
}

function mostrarErroDeConexao(uri: string, origem: string, erro: unknown) {
  const motivo = erro instanceof Error ? erro.message : String(erro);
  const linhas = [
    'Não foi possível conectar ao MongoDB, então a aplicação NÃO foi iniciada',
    '(a porta não foi aberta: se o navegador mostrar outra página em',
    'localhost, ela é de outro programa).',
    '',
    `URI usada: ${mascararUri(uri)}`,
    `Origem:    ${origem}`,
    `Motivo:    ${motivo}`,
    '',
    'Como resolver:',
    '  - Atlas: crie um .env na raiz do projeto com MONGO_URI="mongodb+srv://..."',
    '    (ou MONGODB_URI="mongodb+srv://..."; os dois nomes funcionam)',
    '  - Docker: docker start mongo-financeiro e rode com',
    '      MONGO_URI="mongodb://localhost:27018/controle-financeiro" npm run start:dev',
    '  - Ou suba um MongoDB local na porta 27017.',
  ];
  logger.error('\n\n' + linhas.map((l) => '  ' + l).join('\n') + '\n');
}

void bootstrap();
