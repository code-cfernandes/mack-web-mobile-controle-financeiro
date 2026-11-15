import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseError } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MONGODB_URI_PADRAO } from './config/mongo.config';
import { TransacoesModule } from './transacoes/transacoes.module';

@Module({
  imports: [
    // forRootAsync lê a URI só na inicialização, depois de o main.ts resolvê-la
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || MONGODB_URI_PADRAO,
        // Falha rápido quando o banco está fora do ar: espera até 5 s por
        // tentativa e tenta 2 vezes, em vez de repetir indefinidamente.
        serverSelectionTimeoutMS: 5000,
        retryAttempts: 2,
        retryDelay: 1000,
        // O erro original do driver traz um objeto enorme (topologia do
        // cluster) que o Nest imprime inteiro; fica só nome e mensagem.
        connectionErrorFactory: (erro: MongooseError) => {
          const resumido = new MongooseError(erro.message);
          // name é somente leitura no MongooseError; o stack pode ser redefinido
          Object.defineProperty(resumido, 'stack', {
            value: `${erro.name}: ${erro.message}`,
          });
          return resumido;
        },
      }),
    }),
    TransacoesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
